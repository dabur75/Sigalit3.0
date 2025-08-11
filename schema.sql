--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: calculate_task_efficiency_score(integer, integer); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.calculate_task_efficiency_score(p_guide_id integer, p_days_back integer DEFAULT 30) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    avg_completion_hours DECIMAL;
    efficiency_score DECIMAL;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'בוצע' THEN 1 END),
        AVG(CASE WHEN status = 'בוצע' THEN 
            EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600 
        END)
    INTO total_tasks, completed_tasks, avg_completion_hours
    FROM tasks 
    WHERE assigned_to_id = p_guide_id 
    AND created_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL;
    
    IF total_tasks = 0 THEN
        RETURN 100.0; -- Perfect score for guides with no tasks
    END IF;
    
    -- Calculate efficiency score based on completion rate and speed
    efficiency_score = (completed_tasks::DECIMAL / total_tasks) * 50; -- 50% weight for completion rate
    
    -- Add bonus for quick completion (up to 30 points)
    IF avg_completion_hours IS NOT NULL THEN
        IF avg_completion_hours <= 1 THEN
            efficiency_score := efficiency_score + 30;
        ELSIF avg_completion_hours <= 3 THEN
            efficiency_score := efficiency_score + 20;
        ELSIF avg_completion_hours <= 7 THEN
            efficiency_score := efficiency_score + 10;
        END IF;
    END IF;
    
    -- Add bonus for recent activity (up to 20 points)
    IF EXISTS (
        SELECT 1 FROM tasks 
        WHERE assigned_to_id = p_guide_id 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    ) THEN
        efficiency_score := efficiency_score + 20;
    END IF;
    
    RETURN LEAST(100.0, GREATEST(0.0, efficiency_score));
END;
$$;


ALTER FUNCTION public.calculate_task_efficiency_score(p_guide_id integer, p_days_back integer) OWNER TO sigalit_user;

--
-- Name: get_guide_workload_balance(integer, integer); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.get_guide_workload_balance(p_year integer, p_month integer) RETURNS TABLE(guide_id integer, guide_name character varying, current_shifts integer, target_shifts numeric, balance_percentage numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as guide_id,
        u.name as guide_name,
        COUNT(s.id)::INTEGER as current_shifts,
        (COUNT(s.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM schedule WHERE DATE_TRUNC('month', date) = DATE(p_year || '-' || p_month || '-01')), 0))::DECIMAL as target_shifts,
        (COUNT(s.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM schedule WHERE DATE_TRUNC('month', date) = DATE(p_year || '-' || p_month || '-01')), 0))::DECIMAL as balance_percentage
    FROM users u
    LEFT JOIN schedule s ON u.id = s.guide1_id 
        AND DATE_TRUNC('month', s.date) = DATE(p_year || '-' || p_month || '-01')
    WHERE u.role = 'מדריך' AND u.is_active = true
    GROUP BY u.id, u.name
    ORDER BY balance_percentage DESC;
END;
$$;


ALTER FUNCTION public.get_guide_workload_balance(p_year integer, p_month integer) OWNER TO sigalit_user;

--
-- Name: is_hebrew_text(text); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.is_hebrew_text(text_to_check text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if text contains Hebrew characters (Unicode range 0590-05FF)
    RETURN text_to_check ~ '[\u0590-\u05FF]';
END;
$$;


ALTER FUNCTION public.is_hebrew_text(text_to_check text) OWNER TO sigalit_user;

--
-- Name: refresh_monthly_schedule_stats(); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.refresh_monthly_schedule_stats() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_schedule_stats;
END;
$$;


ALTER FUNCTION public.refresh_monthly_schedule_stats() OWNER TO sigalit_user;

--
-- Name: refresh_task_analytics(); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.refresh_task_analytics() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY task_analytics_daily;
END;
$$;


ALTER FUNCTION public.refresh_task_analytics() OWNER TO sigalit_user;

--
-- Name: update_template_usage(); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.update_template_usage() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.template_id IS NOT NULL AND (OLD.template_id IS NULL OR OLD.template_id != NEW.template_id) THEN
        UPDATE task_templates 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.template_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_template_usage() OWNER TO sigalit_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: sigalit_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO sigalit_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_help_effectiveness; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.ai_help_effectiveness (
    id integer NOT NULL,
    help_topic character varying(100) NOT NULL,
    user_id integer NOT NULL,
    help_provided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    was_helpful boolean,
    completion_rate real,
    follow_up_questions integer DEFAULT 0,
    feedback_text text
);


ALTER TABLE public.ai_help_effectiveness OWNER TO sigalit_user;

--
-- Name: TABLE ai_help_effectiveness; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.ai_help_effectiveness IS 'Effectiveness tracking of AI help and tutorials';


--
-- Name: ai_help_effectiveness_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.ai_help_effectiveness_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ai_help_effectiveness_id_seq OWNER TO sigalit_user;

--
-- Name: ai_help_effectiveness_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.ai_help_effectiveness_id_seq OWNED BY public.ai_help_effectiveness.id;


--
-- Name: ai_scheduling_patterns; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.ai_scheduling_patterns (
    id integer NOT NULL,
    pattern_type character varying(50) NOT NULL,
    guide_id integer,
    conditions jsonb,
    pattern_data jsonb NOT NULL,
    confidence_score real,
    sample_size integer,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.ai_scheduling_patterns OWNER TO sigalit_user;

--
-- Name: TABLE ai_scheduling_patterns; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.ai_scheduling_patterns IS 'Learned patterns about guide behavior and preferences';


--
-- Name: ai_scheduling_patterns_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.ai_scheduling_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ai_scheduling_patterns_id_seq OWNER TO sigalit_user;

--
-- Name: ai_scheduling_patterns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.ai_scheduling_patterns_id_seq OWNED BY public.ai_scheduling_patterns.id;


--
-- Name: ai_suggestion_feedback; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.ai_suggestion_feedback (
    id integer NOT NULL,
    emergency_id integer NOT NULL,
    suggestion_id integer NOT NULL,
    coordinator_id integer NOT NULL,
    feedback_type character varying(20) NOT NULL,
    feedback_score integer,
    feedback_text text,
    what_worked text,
    what_didnt_work text,
    suggested_improvements text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_suggestion_feedback OWNER TO sigalit_user;

--
-- Name: TABLE ai_suggestion_feedback; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.ai_suggestion_feedback IS 'Coordinator feedback on AI suggestions for improvement';


--
-- Name: ai_suggestion_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.ai_suggestion_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ai_suggestion_feedback_id_seq OWNER TO sigalit_user;

--
-- Name: ai_suggestion_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.ai_suggestion_feedback_id_seq OWNED BY public.ai_suggestion_feedback.id;


--
-- Name: ai_swap_suggestions; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.ai_swap_suggestions (
    id integer NOT NULL,
    emergency_id integer NOT NULL,
    suggestion_data jsonb NOT NULL,
    suggestion_type character varying(50) NOT NULL,
    priority_rank integer NOT NULL,
    likelihood_score integer,
    impact_score real,
    complexity_level integer,
    reasoning text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_swap_suggestions OWNER TO sigalit_user;

--
-- Name: TABLE ai_swap_suggestions; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.ai_swap_suggestions IS 'AI-generated swap solutions with scoring and reasoning';


--
-- Name: ai_swap_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.ai_swap_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ai_swap_suggestions_id_seq OWNER TO sigalit_user;

--
-- Name: ai_swap_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.ai_swap_suggestions_id_seq OWNED BY public.ai_swap_suggestions.id;


--
-- Name: assignment_types; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.assignment_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    hours_per_shift integer DEFAULT 24,
    salary_factor numeric(3,2) DEFAULT 1.0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assignment_types OWNER TO sigalit_user;

--
-- Name: assignment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.assignment_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.assignment_types_id_seq OWNER TO sigalit_user;

--
-- Name: assignment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.assignment_types_id_seq OWNED BY public.assignment_types.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id integer,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id integer,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.audit_log OWNER TO sigalit_user;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_log_id_seq OWNER TO sigalit_user;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: constraints; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.constraints (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    date date NOT NULL,
    details text,
    house_id character varying(50) DEFAULT 'dror'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.constraints OWNER TO sigalit_user;

--
-- Name: TABLE constraints; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.constraints IS 'אילוצים אישיים של המדריכים';


--
-- Name: constraints_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.constraints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.constraints_id_seq OWNER TO sigalit_user;

--
-- Name: constraints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.constraints_id_seq OWNED BY public.constraints.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.conversation_participants (
    conversation_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.conversation_participants OWNER TO sigalit_user;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conversations OWNER TO sigalit_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversations_id_seq OWNER TO sigalit_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: coordinator_rules; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.coordinator_rules (
    id integer NOT NULL,
    rule_type character varying(50) NOT NULL,
    guide1_id integer,
    guide2_id integer,
    description text,
    is_active boolean DEFAULT true,
    created_by integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coordinator_rules OWNER TO sigalit_user;

--
-- Name: TABLE coordinator_rules; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.coordinator_rules IS 'כללי תיאום בין רכזים';


--
-- Name: coordinator_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.coordinator_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coordinator_rules_id_seq OWNER TO sigalit_user;

--
-- Name: coordinator_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.coordinator_rules_id_seq OWNED BY public.coordinator_rules.id;


--
-- Name: doctor_referrals; Type: TABLE; Schema: public; Owner: dvirhillelcoheneraki
--

CREATE TABLE public.doctor_referrals (
    id integer NOT NULL,
    patient character varying(255) NOT NULL,
    reason text NOT NULL,
    doctor character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(50) DEFAULT 'פתוח'::character varying,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    closed_at timestamp without time zone,
    closed_by character varying(100),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);


ALTER TABLE public.doctor_referrals OWNER TO dvirhillelcoheneraki;

--
-- Name: doctor_referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: dvirhillelcoheneraki
--

CREATE SEQUENCE public.doctor_referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.doctor_referrals_id_seq OWNER TO dvirhillelcoheneraki;

--
-- Name: doctor_referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dvirhillelcoheneraki
--

ALTER SEQUENCE public.doctor_referrals_id_seq OWNED BY public.doctor_referrals.id;


--
-- Name: drafts; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.drafts (
    id integer NOT NULL,
    month character varying(7) NOT NULL,
    version integer NOT NULL,
    name character varying(255) NOT NULL,
    data jsonb NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_final boolean DEFAULT false,
    approved_at timestamp without time zone,
    approved_by integer
);


ALTER TABLE public.drafts OWNER TO sigalit_user;

--
-- Name: drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.drafts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.drafts_id_seq OWNER TO sigalit_user;

--
-- Name: drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.drafts_id_seq OWNED BY public.drafts.id;


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.email_logs (
    id integer NOT NULL,
    month character varying(7) NOT NULL,
    draft_version integer NOT NULL,
    recipient_id integer,
    recipient_email character varying(255),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    email_content text,
    CONSTRAINT email_logs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.email_logs OWNER TO sigalit_user;

--
-- Name: email_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.email_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_logs_id_seq OWNER TO sigalit_user;

--
-- Name: email_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.email_logs_id_seq OWNED BY public.email_logs.id;


--
-- Name: emergency_swap_requests; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.emergency_swap_requests (
    id integer NOT NULL,
    original_guide_id integer NOT NULL,
    date date NOT NULL,
    shift_type character varying(50) NOT NULL,
    reason text,
    urgency_level character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp without time zone,
    resolution_type character varying(50),
    coordinator_id integer
);


ALTER TABLE public.emergency_swap_requests OWNER TO sigalit_user;

--
-- Name: TABLE emergency_swap_requests; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.emergency_swap_requests IS 'Records each emergency situation requiring guide replacement';


--
-- Name: emergency_swap_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.emergency_swap_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.emergency_swap_requests_id_seq OWNER TO sigalit_user;

--
-- Name: emergency_swap_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.emergency_swap_requests_id_seq OWNED BY public.emergency_swap_requests.id;


--
-- Name: executed_swaps; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.executed_swaps (
    id integer NOT NULL,
    emergency_id integer NOT NULL,
    final_solution jsonb NOT NULL,
    affected_guides jsonb NOT NULL,
    confirmation_method character varying(50),
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    coordinator_id integer NOT NULL,
    coordinator_notes text
);


ALTER TABLE public.executed_swaps OWNER TO sigalit_user;

--
-- Name: TABLE executed_swaps; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.executed_swaps IS 'Successfully executed swap solutions for analysis';


--
-- Name: executed_swaps_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.executed_swaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.executed_swaps_id_seq OWNER TO sigalit_user;

--
-- Name: executed_swaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.executed_swaps_id_seq OWNED BY public.executed_swaps.id;


--
-- Name: fixed_constraints; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.fixed_constraints (
    id integer NOT NULL,
    user_id integer NOT NULL,
    weekday integer NOT NULL,
    hour_start time without time zone,
    hour_end time without time zone,
    details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fixed_constraints_weekday_check CHECK (((weekday >= 0) AND (weekday <= 6)))
);


ALTER TABLE public.fixed_constraints OWNER TO sigalit_user;

--
-- Name: fixed_constraints_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.fixed_constraints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fixed_constraints_id_seq OWNER TO sigalit_user;

--
-- Name: fixed_constraints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.fixed_constraints_id_seq OWNED BY public.fixed_constraints.id;


--
-- Name: guide_availability; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.guide_availability (
    id integer NOT NULL,
    guide_id integer NOT NULL,
    date date NOT NULL,
    status character varying(50) NOT NULL,
    reason text,
    override_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.guide_availability OWNER TO sigalit_user;

--
-- Name: guide_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.guide_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guide_availability_id_seq OWNER TO sigalit_user;

--
-- Name: guide_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.guide_availability_id_seq OWNED BY public.guide_availability.id;


--
-- Name: guide_contact_history; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.guide_contact_history (
    id integer NOT NULL,
    emergency_id integer NOT NULL,
    suggestion_id integer,
    contacted_guide_id integer NOT NULL,
    contact_order integer NOT NULL,
    coordinator_id integer NOT NULL,
    contacted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contact_method character varying(20),
    response character varying(20),
    response_time interval,
    decline_reason text,
    notes text
);


ALTER TABLE public.guide_contact_history OWNER TO sigalit_user;

--
-- Name: TABLE guide_contact_history; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.guide_contact_history IS 'Tracks coordinator attempts to contact guides for learning';


--
-- Name: guide_contact_history_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.guide_contact_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guide_contact_history_id_seq OWNER TO sigalit_user;

--
-- Name: guide_contact_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.guide_contact_history_id_seq OWNED BY public.guide_contact_history.id;


--
-- Name: guide_preferences; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.guide_preferences (
    id integer NOT NULL,
    guide_id integer NOT NULL,
    preference_type character varying(50) NOT NULL,
    preference_value character varying(100),
    strength real,
    learned_from_data boolean DEFAULT true,
    last_reinforced timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.guide_preferences OWNER TO sigalit_user;

--
-- Name: TABLE guide_preferences; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.guide_preferences IS 'Individual guide preferences learned from behavior';


--
-- Name: guide_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.guide_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guide_preferences_id_seq OWNER TO sigalit_user;

--
-- Name: guide_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.guide_preferences_id_seq OWNED BY public.guide_preferences.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    creator_id integer,
    assigned_to_id integer,
    status character varying(50),
    shift_date date,
    notes text,
    closed_by_id integer,
    closed_at timestamp without time zone,
    house_id character varying(50) DEFAULT 'dror'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'רגיל'::character varying,
    assigned_at timestamp without time zone,
    due_date date,
    estimated_hours integer DEFAULT 1,
    category character varying(100),
    tags text[],
    template_id integer,
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['נמוך'::character varying, 'רגיל'::character varying, 'גבוה'::character varying, 'דחוף'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO sigalit_user;

--
-- Name: COLUMN tasks.priority; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.priority IS 'Task priority level: נמוך, רגיל, גבוה, דחוף';


--
-- Name: COLUMN tasks.assigned_at; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.assigned_at IS 'Timestamp when task was assigned to guide';


--
-- Name: COLUMN tasks.due_date; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.due_date IS 'Due date for task completion';


--
-- Name: COLUMN tasks.estimated_hours; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.estimated_hours IS 'Estimated time to complete task in hours';


--
-- Name: COLUMN tasks.category; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.category IS 'Task category for organization';


--
-- Name: COLUMN tasks.tags; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.tasks.tags IS 'Array of tags for task classification';


--
-- Name: users; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    password character varying(255),
    email character varying(255),
    phone character varying(50),
    percent integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    house_id character varying(50) DEFAULT 'dror'::character varying,
    accessible_houses jsonb DEFAULT '["dror", "havatzelet"]'::jsonb,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['מדריך'::character varying, 'רכז'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO sigalit_user;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.users IS 'משתמשי המערכת - מדריכים ורכזים';


--
-- Name: guide_workload; Type: VIEW; Schema: public; Owner: sigalit_user
--

CREATE VIEW public.guide_workload AS
 SELECT u.id AS guide_id,
    u.name AS guide_name,
    count(t.id) AS total_tasks,
    count(
        CASE
            WHEN ((t.status)::text = 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_tasks,
    count(
        CASE
            WHEN ((t.status)::text <> 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_tasks,
    count(
        CASE
            WHEN ((t.priority)::text = 'דחוף'::text) THEN 1
            ELSE NULL::integer
        END) AS urgent_tasks,
    avg(
        CASE
            WHEN ((t.status)::text = 'בוצע'::text) THEN (EXTRACT(epoch FROM (t.closed_at - t.created_at)) / (3600)::numeric)
            ELSE NULL::numeric
        END) AS avg_completion_hours,
    max(t.created_at) AS last_task_date
   FROM (public.users u
     LEFT JOIN public.tasks t ON ((u.id = t.assigned_to_id)))
  WHERE (((u.role)::text = 'מדריך'::text) AND (u.is_active = true))
  GROUP BY u.id, u.name
  ORDER BY (count(
        CASE
            WHEN ((t.status)::text <> 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END)) DESC, (count(t.id)) DESC;


ALTER TABLE public.guide_workload OWNER TO sigalit_user;

--
-- Name: houses; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.houses (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.houses OWNER TO sigalit_user;

--
-- Name: TABLE houses; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.houses IS 'בתי המגורים במערכת';


--
-- Name: messages; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    from_user_id integer NOT NULL,
    to_user_id integer NOT NULL,
    text text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO sigalit_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO sigalit_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: schedule; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.schedule (
    id integer NOT NULL,
    date date NOT NULL,
    weekday character varying(20) NOT NULL,
    type character varying(50) NOT NULL,
    guide1_id integer,
    guide2_id integer,
    is_manual boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guide1_name character varying(100),
    guide1_role character varying(50),
    guide2_name character varying(100),
    guide2_role character varying(50),
    house_id character varying(50) DEFAULT 'dror'::character varying NOT NULL
);


ALTER TABLE public.schedule OWNER TO sigalit_user;

--
-- Name: TABLE schedule; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.schedule IS 'לוח הזמנים הראשי של המשמרות';


--
-- Name: monthly_schedule_stats; Type: MATERIALIZED VIEW; Schema: public; Owner: sigalit_user
--

CREATE MATERIALIZED VIEW public.monthly_schedule_stats AS
 SELECT date_trunc('month'::text, (schedule.date)::timestamp with time zone) AS month,
    schedule.guide1_id,
    count(*) AS shift_count,
    count(
        CASE
            WHEN (schedule.is_manual = true) THEN 1
            ELSE NULL::integer
        END) AS manual_shifts,
    count(
        CASE
            WHEN (schedule.is_locked = true) THEN 1
            ELSE NULL::integer
        END) AS locked_shifts
   FROM public.schedule
  GROUP BY (date_trunc('month'::text, (schedule.date)::timestamp with time zone)), schedule.guide1_id
  WITH NO DATA;


ALTER TABLE public.monthly_schedule_stats OWNER TO sigalit_user;

--
-- Name: official_schedules; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.official_schedules (
    id integer NOT NULL,
    month character varying(7) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    schedule_data jsonb NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    notes text
);


ALTER TABLE public.official_schedules OWNER TO sigalit_user;

--
-- Name: official_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.official_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.official_schedules_id_seq OWNER TO sigalit_user;

--
-- Name: official_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.official_schedules_id_seq OWNED BY public.official_schedules.id;


--
-- Name: overrides_activities; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.overrides_activities (
    id integer NOT NULL,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100),
    facilitator character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.overrides_activities OWNER TO sigalit_user;

--
-- Name: overrides_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.overrides_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.overrides_activities_id_seq OWNER TO sigalit_user;

--
-- Name: overrides_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.overrides_activities_id_seq OWNED BY public.overrides_activities.id;


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    patient character varying(255) NOT NULL,
    reason text NOT NULL,
    doctor character varying(255) NOT NULL,
    date date NOT NULL,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.referrals OWNER TO sigalit_user;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.referrals_id_seq OWNER TO sigalit_user;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: schedule_draft; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.schedule_draft (
    id integer NOT NULL,
    date date NOT NULL,
    weekday character varying(20) NOT NULL,
    type character varying(50) NOT NULL,
    guide1_id integer,
    guide2_id integer,
    name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.schedule_draft OWNER TO sigalit_user;

--
-- Name: schedule_draft_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.schedule_draft_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schedule_draft_id_seq OWNER TO sigalit_user;

--
-- Name: schedule_draft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.schedule_draft_id_seq OWNED BY public.schedule_draft.id;


--
-- Name: schedule_history; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.schedule_history (
    id integer NOT NULL,
    month character varying(7) NOT NULL,
    schedule_type character varying(20) NOT NULL,
    version integer NOT NULL,
    schedule_data jsonb NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    action character varying(50),
    notes text,
    CONSTRAINT schedule_history_schedule_type_check CHECK (((schedule_type)::text = ANY ((ARRAY['draft'::character varying, 'official'::character varying])::text[])))
);


ALTER TABLE public.schedule_history OWNER TO sigalit_user;

--
-- Name: schedule_history_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.schedule_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schedule_history_id_seq OWNER TO sigalit_user;

--
-- Name: schedule_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.schedule_history_id_seq OWNED BY public.schedule_history.id;


--
-- Name: schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schedule_id_seq OWNER TO sigalit_user;

--
-- Name: schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.schedule_id_seq OWNED BY public.schedule.id;


--
-- Name: scheduling_rules; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.scheduling_rules (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    guide_id integer NOT NULL,
    guide2_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    CONSTRAINT scheduling_rules_type_check CHECK (((type)::text = ANY ((ARRAY['manual_only'::character varying, 'prevent_pair'::character varying])::text[])))
);


ALTER TABLE public.scheduling_rules OWNER TO sigalit_user;

--
-- Name: scheduling_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.scheduling_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scheduling_rules_id_seq OWNER TO sigalit_user;

--
-- Name: scheduling_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.scheduling_rules_id_seq OWNED BY public.scheduling_rules.id;


--
-- Name: shabbat_status; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.shabbat_status (
    date date NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shabbat_status_status_check CHECK (((status)::text = ANY ((ARRAY['סגורה'::character varying, 'פתוחה'::character varying])::text[])))
);


ALTER TABLE public.shabbat_status OWNER TO sigalit_user;

--
-- Name: shift_types; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.shift_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    guides_required integer DEFAULT 2,
    roles_required jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shift_types OWNER TO sigalit_user;

--
-- Name: shift_types_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.shift_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shift_types_id_seq OWNER TO sigalit_user;

--
-- Name: shift_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.shift_types_id_seq OWNED BY public.shift_types.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    date date NOT NULL,
    day character varying(20) NOT NULL,
    handover_guide_id integer,
    regular_guide_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shifts OWNER TO sigalit_user;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shifts_id_seq OWNER TO sigalit_user;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: task_analytics_daily; Type: MATERIALIZED VIEW; Schema: public; Owner: sigalit_user
--

CREATE MATERIALIZED VIEW public.task_analytics_daily AS
 SELECT date_trunc('day'::text, tasks.created_at) AS date,
    count(*) AS total_tasks,
    count(
        CASE
            WHEN ((tasks.status)::text = 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_tasks,
    count(
        CASE
            WHEN ((tasks.status)::text <> 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'דחוף'::text) THEN 1
            ELSE NULL::integer
        END) AS urgent_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'גבוה'::text) THEN 1
            ELSE NULL::integer
        END) AS high_priority_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'רגיל'::text) THEN 1
            ELSE NULL::integer
        END) AS normal_priority_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'נמוך'::text) THEN 1
            ELSE NULL::integer
        END) AS low_priority_tasks,
    count(DISTINCT tasks.assigned_to_id) AS active_guides,
    count(DISTINCT tasks.creator_id) AS active_creators,
    avg(
        CASE
            WHEN ((tasks.status)::text = 'בוצע'::text) THEN (EXTRACT(epoch FROM (tasks.closed_at - tasks.created_at)) / (3600)::numeric)
            ELSE NULL::numeric
        END) AS avg_completion_hours,
    (((count(
        CASE
            WHEN ((tasks.status)::text = 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END))::numeric / (count(*))::numeric) * (100)::numeric) AS completion_rate
   FROM public.tasks
  WHERE (tasks.created_at >= (CURRENT_DATE - '90 days'::interval))
  GROUP BY (date_trunc('day'::text, tasks.created_at))
  ORDER BY (date_trunc('day'::text, tasks.created_at)) DESC
  WITH NO DATA;


ALTER TABLE public.task_analytics_daily OWNER TO sigalit_user;

--
-- Name: task_statistics; Type: VIEW; Schema: public; Owner: sigalit_user
--

CREATE VIEW public.task_statistics AS
 SELECT date_trunc('day'::text, tasks.created_at) AS date,
    count(*) AS total_tasks,
    count(
        CASE
            WHEN ((tasks.status)::text = 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_tasks,
    count(
        CASE
            WHEN ((tasks.status)::text <> 'בוצע'::text) THEN 1
            ELSE NULL::integer
        END) AS pending_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'דחוף'::text) THEN 1
            ELSE NULL::integer
        END) AS urgent_tasks,
    count(
        CASE
            WHEN ((tasks.priority)::text = 'גבוה'::text) THEN 1
            ELSE NULL::integer
        END) AS high_priority_tasks,
    avg(
        CASE
            WHEN ((tasks.status)::text = 'בוצע'::text) THEN (EXTRACT(epoch FROM (tasks.closed_at - tasks.created_at)) / (3600)::numeric)
            ELSE NULL::numeric
        END) AS avg_completion_hours
   FROM public.tasks
  WHERE (tasks.created_at >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY (date_trunc('day'::text, tasks.created_at))
  ORDER BY (date_trunc('day'::text, tasks.created_at)) DESC;


ALTER TABLE public.task_statistics OWNER TO sigalit_user;

--
-- Name: task_templates; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.task_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    default_text text NOT NULL,
    default_priority character varying(20) DEFAULT 'רגיל'::character varying,
    default_category character varying(100),
    default_estimated_hours integer DEFAULT 1,
    default_tags text[],
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usage_count integer DEFAULT 0
);


ALTER TABLE public.task_templates OWNER TO sigalit_user;

--
-- Name: TABLE task_templates; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.task_templates IS 'Templates for creating standardized tasks';


--
-- Name: COLUMN task_templates.usage_count; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON COLUMN public.task_templates.usage_count IS 'Number of times this template has been used';


--
-- Name: task_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.task_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_templates_id_seq OWNER TO sigalit_user;

--
-- Name: task_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.task_templates_id_seq OWNED BY public.task_templates.id;


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO sigalit_user;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_interaction_patterns; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.user_interaction_patterns (
    id integer NOT NULL,
    user_id integer NOT NULL,
    interaction_type character varying(50) NOT NULL,
    context_data jsonb,
    frequency_count integer DEFAULT 1,
    last_interaction timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    success_rate real,
    average_time interval
);


ALTER TABLE public.user_interaction_patterns OWNER TO sigalit_user;

--
-- Name: TABLE user_interaction_patterns; Type: COMMENT; Schema: public; Owner: sigalit_user
--

COMMENT ON TABLE public.user_interaction_patterns IS 'User behavior patterns for personalized assistance';


--
-- Name: user_interaction_patterns_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.user_interaction_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_interaction_patterns_id_seq OWNER TO sigalit_user;

--
-- Name: user_interaction_patterns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.user_interaction_patterns_id_seq OWNED BY public.user_interaction_patterns.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO sigalit_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: v_emergency_swap_summary; Type: VIEW; Schema: public; Owner: sigalit_user
--

CREATE VIEW public.v_emergency_swap_summary AS
SELECT
    NULL::integer AS id,
    NULL::integer AS original_guide_id,
    NULL::date AS date,
    NULL::character varying(50) AS shift_type,
    NULL::text AS reason,
    NULL::character varying(20) AS urgency_level,
    NULL::timestamp without time zone AS created_at,
    NULL::timestamp without time zone AS resolved_at,
    NULL::character varying(50) AS resolution_type,
    NULL::integer AS coordinator_id,
    NULL::character varying(100) AS original_guide_name,
    NULL::character varying(100) AS coordinator_name,
    NULL::bigint AS contact_attempts,
    NULL::bigint AS acceptances,
    NULL::bigint AS declines,
    NULL::boolean AS was_executed;


ALTER TABLE public.v_emergency_swap_summary OWNER TO sigalit_user;

--
-- Name: v_guide_emergency_stats; Type: VIEW; Schema: public; Owner: sigalit_user
--

CREATE VIEW public.v_guide_emergency_stats AS
 SELECT u.id,
    u.name,
    count(gch.id) AS total_emergency_contacts,
    count(
        CASE
            WHEN ((gch.response)::text = 'accepted'::text) THEN 1
            ELSE NULL::integer
        END) AS acceptances,
    count(
        CASE
            WHEN ((gch.response)::text = 'declined'::text) THEN 1
            ELSE NULL::integer
        END) AS declines,
        CASE
            WHEN (count(gch.id) > 0) THEN round((((count(
            CASE
                WHEN ((gch.response)::text = 'accepted'::text) THEN 1
                ELSE NULL::integer
            END))::numeric * 100.0) / (count(gch.id))::numeric), 1)
            ELSE (0)::numeric
        END AS acceptance_rate,
    avg((EXTRACT(epoch FROM gch.response_time) / (60)::numeric)) AS avg_response_minutes
   FROM (public.users u
     LEFT JOIN public.guide_contact_history gch ON ((u.id = gch.contacted_guide_id)))
  WHERE (((u.role)::text = 'מדריך'::text) AND (u.is_active = true))
  GROUP BY u.id, u.name
  ORDER BY
        CASE
            WHEN (count(gch.id) > 0) THEN round((((count(
            CASE
                WHEN ((gch.response)::text = 'accepted'::text) THEN 1
                ELSE NULL::integer
            END))::numeric * 100.0) / (count(gch.id))::numeric), 1)
            ELSE (0)::numeric
        END DESC, (count(gch.id)) DESC;


ALTER TABLE public.v_guide_emergency_stats OWNER TO sigalit_user;

--
-- Name: vacations; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.vacations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date_start date NOT NULL,
    date_end date NOT NULL,
    note text,
    status character varying(50),
    response_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK ((date_end >= date_start))
);


ALTER TABLE public.vacations OWNER TO sigalit_user;

--
-- Name: vacations_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.vacations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vacations_id_seq OWNER TO sigalit_user;

--
-- Name: vacations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.vacations_id_seq OWNED BY public.vacations.id;


--
-- Name: weekend_types; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.weekend_types (
    id integer NOT NULL,
    date date NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weekend_types OWNER TO sigalit_user;

--
-- Name: weekend_types_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.weekend_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weekend_types_id_seq OWNER TO sigalit_user;

--
-- Name: weekend_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.weekend_types_id_seq OWNED BY public.weekend_types.id;


--
-- Name: weekly_activities; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.weekly_activities (
    id integer NOT NULL,
    weekday character varying(20) NOT NULL,
    "time" time without time zone NOT NULL,
    duration interval,
    title character varying(255) NOT NULL,
    category character varying(100),
    facilitator character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weekly_activities OWNER TO sigalit_user;

--
-- Name: weekly_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: sigalit_user
--

CREATE SEQUENCE public.weekly_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weekly_activities_id_seq OWNER TO sigalit_user;

--
-- Name: weekly_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sigalit_user
--

ALTER SEQUENCE public.weekly_activities_id_seq OWNED BY public.weekly_activities.id;


--
-- Name: workflow_status; Type: TABLE; Schema: public; Owner: sigalit_user
--

CREATE TABLE public.workflow_status (
    month character varying(7) NOT NULL,
    current_draft_version integer DEFAULT 0,
    is_finalized boolean DEFAULT false,
    finalized_at timestamp without time zone,
    finalized_by integer,
    last_email_sent_version integer DEFAULT 0,
    last_email_sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_status OWNER TO sigalit_user;

--
-- Name: ai_help_effectiveness id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_help_effectiveness ALTER COLUMN id SET DEFAULT nextval('public.ai_help_effectiveness_id_seq'::regclass);


--
-- Name: ai_scheduling_patterns id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_scheduling_patterns ALTER COLUMN id SET DEFAULT nextval('public.ai_scheduling_patterns_id_seq'::regclass);


--
-- Name: ai_suggestion_feedback id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_suggestion_feedback ALTER COLUMN id SET DEFAULT nextval('public.ai_suggestion_feedback_id_seq'::regclass);


--
-- Name: ai_swap_suggestions id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_swap_suggestions ALTER COLUMN id SET DEFAULT nextval('public.ai_swap_suggestions_id_seq'::regclass);


--
-- Name: assignment_types id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.assignment_types ALTER COLUMN id SET DEFAULT nextval('public.assignment_types_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: constraints id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.constraints ALTER COLUMN id SET DEFAULT nextval('public.constraints_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: coordinator_rules id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.coordinator_rules ALTER COLUMN id SET DEFAULT nextval('public.coordinator_rules_id_seq'::regclass);


--
-- Name: doctor_referrals id; Type: DEFAULT; Schema: public; Owner: dvirhillelcoheneraki
--

ALTER TABLE ONLY public.doctor_referrals ALTER COLUMN id SET DEFAULT nextval('public.doctor_referrals_id_seq'::regclass);


--
-- Name: drafts id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.drafts ALTER COLUMN id SET DEFAULT nextval('public.drafts_id_seq'::regclass);


--
-- Name: email_logs id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.email_logs ALTER COLUMN id SET DEFAULT nextval('public.email_logs_id_seq'::regclass);


--
-- Name: emergency_swap_requests id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.emergency_swap_requests ALTER COLUMN id SET DEFAULT nextval('public.emergency_swap_requests_id_seq'::regclass);


--
-- Name: executed_swaps id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.executed_swaps ALTER COLUMN id SET DEFAULT nextval('public.executed_swaps_id_seq'::regclass);


--
-- Name: fixed_constraints id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.fixed_constraints ALTER COLUMN id SET DEFAULT nextval('public.fixed_constraints_id_seq'::regclass);


--
-- Name: guide_availability id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_availability ALTER COLUMN id SET DEFAULT nextval('public.guide_availability_id_seq'::regclass);


--
-- Name: guide_contact_history id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history ALTER COLUMN id SET DEFAULT nextval('public.guide_contact_history_id_seq'::regclass);


--
-- Name: guide_preferences id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_preferences ALTER COLUMN id SET DEFAULT nextval('public.guide_preferences_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: official_schedules id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.official_schedules ALTER COLUMN id SET DEFAULT nextval('public.official_schedules_id_seq'::regclass);


--
-- Name: overrides_activities id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.overrides_activities ALTER COLUMN id SET DEFAULT nextval('public.overrides_activities_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: schedule id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule ALTER COLUMN id SET DEFAULT nextval('public.schedule_id_seq'::regclass);


--
-- Name: schedule_draft id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_draft ALTER COLUMN id SET DEFAULT nextval('public.schedule_draft_id_seq'::regclass);


--
-- Name: schedule_history id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_history ALTER COLUMN id SET DEFAULT nextval('public.schedule_history_id_seq'::regclass);


--
-- Name: scheduling_rules id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.scheduling_rules ALTER COLUMN id SET DEFAULT nextval('public.scheduling_rules_id_seq'::regclass);


--
-- Name: shift_types id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shift_types ALTER COLUMN id SET DEFAULT nextval('public.shift_types_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: task_templates id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.task_templates ALTER COLUMN id SET DEFAULT nextval('public.task_templates_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_interaction_patterns id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.user_interaction_patterns ALTER COLUMN id SET DEFAULT nextval('public.user_interaction_patterns_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vacations id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.vacations ALTER COLUMN id SET DEFAULT nextval('public.vacations_id_seq'::regclass);


--
-- Name: weekend_types id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.weekend_types ALTER COLUMN id SET DEFAULT nextval('public.weekend_types_id_seq'::regclass);


--
-- Name: weekly_activities id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.weekly_activities ALTER COLUMN id SET DEFAULT nextval('public.weekly_activities_id_seq'::regclass);


--
-- Name: ai_help_effectiveness ai_help_effectiveness_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_help_effectiveness
    ADD CONSTRAINT ai_help_effectiveness_pkey PRIMARY KEY (id);


--
-- Name: ai_scheduling_patterns ai_scheduling_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_scheduling_patterns
    ADD CONSTRAINT ai_scheduling_patterns_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestion_feedback ai_suggestion_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_suggestion_feedback
    ADD CONSTRAINT ai_suggestion_feedback_pkey PRIMARY KEY (id);


--
-- Name: ai_swap_suggestions ai_swap_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_swap_suggestions
    ADD CONSTRAINT ai_swap_suggestions_pkey PRIMARY KEY (id);


--
-- Name: assignment_types assignment_types_name_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.assignment_types
    ADD CONSTRAINT assignment_types_name_key UNIQUE (name);


--
-- Name: assignment_types assignment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.assignment_types
    ADD CONSTRAINT assignment_types_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: constraints constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: coordinator_rules coordinator_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.coordinator_rules
    ADD CONSTRAINT coordinator_rules_pkey PRIMARY KEY (id);


--
-- Name: doctor_referrals doctor_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: dvirhillelcoheneraki
--

ALTER TABLE ONLY public.doctor_referrals
    ADD CONSTRAINT doctor_referrals_pkey PRIMARY KEY (id);


--
-- Name: drafts drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.drafts
    ADD CONSTRAINT drafts_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: emergency_swap_requests emergency_swap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.emergency_swap_requests
    ADD CONSTRAINT emergency_swap_requests_pkey PRIMARY KEY (id);


--
-- Name: executed_swaps executed_swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.executed_swaps
    ADD CONSTRAINT executed_swaps_pkey PRIMARY KEY (id);


--
-- Name: fixed_constraints fixed_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.fixed_constraints
    ADD CONSTRAINT fixed_constraints_pkey PRIMARY KEY (id);


--
-- Name: guide_availability guide_availability_guide_id_date_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_availability
    ADD CONSTRAINT guide_availability_guide_id_date_key UNIQUE (guide_id, date);


--
-- Name: guide_availability guide_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_availability
    ADD CONSTRAINT guide_availability_pkey PRIMARY KEY (id);


--
-- Name: guide_contact_history guide_contact_history_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history
    ADD CONSTRAINT guide_contact_history_pkey PRIMARY KEY (id);


--
-- Name: guide_preferences guide_preferences_guide_id_preference_type_preference_value_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_preferences
    ADD CONSTRAINT guide_preferences_guide_id_preference_type_preference_value_key UNIQUE (guide_id, preference_type, preference_value);


--
-- Name: guide_preferences guide_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_preferences
    ADD CONSTRAINT guide_preferences_pkey PRIMARY KEY (id);


--
-- Name: houses houses_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: official_schedules official_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.official_schedules
    ADD CONSTRAINT official_schedules_pkey PRIMARY KEY (id);


--
-- Name: overrides_activities overrides_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.overrides_activities
    ADD CONSTRAINT overrides_activities_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: schedule_draft schedule_draft_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_draft
    ADD CONSTRAINT schedule_draft_pkey PRIMARY KEY (id);


--
-- Name: schedule_history schedule_history_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_history
    ADD CONSTRAINT schedule_history_pkey PRIMARY KEY (id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (id);


--
-- Name: scheduling_rules scheduling_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.scheduling_rules
    ADD CONSTRAINT scheduling_rules_pkey PRIMARY KEY (id);


--
-- Name: shabbat_status shabbat_status_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shabbat_status
    ADD CONSTRAINT shabbat_status_pkey PRIMARY KEY (date);


--
-- Name: shift_types shift_types_name_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shift_types
    ADD CONSTRAINT shift_types_name_key UNIQUE (name);


--
-- Name: shift_types shift_types_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shift_types
    ADD CONSTRAINT shift_types_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: task_templates task_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.task_templates
    ADD CONSTRAINT task_templates_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_interaction_patterns user_interaction_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.user_interaction_patterns
    ADD CONSTRAINT user_interaction_patterns_pkey PRIMARY KEY (id);


--
-- Name: user_interaction_patterns user_interaction_patterns_user_id_interaction_type_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.user_interaction_patterns
    ADD CONSTRAINT user_interaction_patterns_user_id_interaction_type_key UNIQUE (user_id, interaction_type);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vacations vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_pkey PRIMARY KEY (id);


--
-- Name: weekend_types weekend_types_date_key; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.weekend_types
    ADD CONSTRAINT weekend_types_date_key UNIQUE (date);


--
-- Name: weekend_types weekend_types_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.weekend_types
    ADD CONSTRAINT weekend_types_pkey PRIMARY KEY (id);


--
-- Name: weekly_activities weekly_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.weekly_activities
    ADD CONSTRAINT weekly_activities_pkey PRIMARY KEY (id);


--
-- Name: workflow_status workflow_status_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_pkey PRIMARY KEY (month);


--
-- Name: idx_ai_patterns_active; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_ai_patterns_active ON public.ai_scheduling_patterns USING btree (is_active, confidence_score);


--
-- Name: idx_ai_patterns_guide; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_ai_patterns_guide ON public.ai_scheduling_patterns USING btree (guide_id, pattern_type);


--
-- Name: idx_audit_log_table_record; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);


--
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");


--
-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_audit_log_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_constraints_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_constraints_date ON public.constraints USING btree (date);


--
-- Name: idx_constraints_house; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_constraints_house ON public.constraints USING btree (house_id);


--
-- Name: idx_constraints_user_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_constraints_user_date ON public.constraints USING btree (user_id, date);


--
-- Name: idx_contact_history_emergency; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_contact_history_emergency ON public.guide_contact_history USING btree (emergency_id);


--
-- Name: idx_contact_history_guide; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_contact_history_guide ON public.guide_contact_history USING btree (contacted_guide_id);


--
-- Name: idx_contact_history_response; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_contact_history_response ON public.guide_contact_history USING btree (response, contacted_at);


--
-- Name: idx_coordinator_rules_guides; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_coordinator_rules_guides ON public.coordinator_rules USING btree (guide1_id, guide2_id, is_active);


--
-- Name: idx_coordinator_rules_type; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_coordinator_rules_type ON public.coordinator_rules USING btree (rule_type, is_active);


--
-- Name: idx_doctor_referrals_created_by; Type: INDEX; Schema: public; Owner: dvirhillelcoheneraki
--

CREATE INDEX idx_doctor_referrals_created_by ON public.doctor_referrals USING btree (created_by);


--
-- Name: idx_doctor_referrals_date; Type: INDEX; Schema: public; Owner: dvirhillelcoheneraki
--

CREATE INDEX idx_doctor_referrals_date ON public.doctor_referrals USING btree (date);


--
-- Name: idx_doctor_referrals_status; Type: INDEX; Schema: public; Owner: dvirhillelcoheneraki
--

CREATE INDEX idx_doctor_referrals_status ON public.doctor_referrals USING btree (status);


--
-- Name: idx_emergency_requests_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_emergency_requests_date ON public.emergency_swap_requests USING btree (date);


--
-- Name: idx_emergency_requests_guide; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_emergency_requests_guide ON public.emergency_swap_requests USING btree (original_guide_id);


--
-- Name: idx_emergency_requests_resolved; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_emergency_requests_resolved ON public.emergency_swap_requests USING btree (resolved_at, resolution_type);


--
-- Name: idx_feedback_emergency; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_feedback_emergency ON public.ai_suggestion_feedback USING btree (emergency_id);


--
-- Name: idx_feedback_suggestion; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_feedback_suggestion ON public.ai_suggestion_feedback USING btree (suggestion_id);


--
-- Name: idx_fixed_constraints_user_weekday; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_fixed_constraints_user_weekday ON public.fixed_constraints USING btree (user_id, weekday);


--
-- Name: idx_guide_availability_guide_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_guide_availability_guide_date ON public.guide_availability USING btree (guide_id, date);


--
-- Name: idx_guide_preferences_guide; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_guide_preferences_guide ON public.guide_preferences USING btree (guide_id, preference_type);


--
-- Name: idx_guide_preferences_strength; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_guide_preferences_strength ON public.guide_preferences USING btree (strength DESC);


--
-- Name: idx_monthly_schedule_stats_month_guide; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE UNIQUE INDEX idx_monthly_schedule_stats_month_guide ON public.monthly_schedule_stats USING btree (month, guide1_id);


--
-- Name: idx_schedule_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_schedule_date ON public.schedule USING btree (date);


--
-- Name: idx_schedule_guides; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_schedule_guides ON public.schedule USING btree (guide1_id, guide2_id);


--
-- Name: idx_schedule_house; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_schedule_house ON public.schedule USING btree (house_id);


--
-- Name: idx_schedule_manual; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_schedule_manual ON public.schedule USING btree (is_manual, is_locked);


--
-- Name: idx_task_analytics_daily_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE UNIQUE INDEX idx_task_analytics_daily_date ON public.task_analytics_daily USING btree (date);


--
-- Name: idx_task_templates_active; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_task_templates_active ON public.task_templates USING btree (is_active);


--
-- Name: idx_task_templates_category; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_task_templates_category ON public.task_templates USING btree (default_category);


--
-- Name: idx_tasks_assigned; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_assigned ON public.tasks USING btree (assigned_to_id);


--
-- Name: idx_tasks_category; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_category ON public.tasks USING btree (category);


--
-- Name: idx_tasks_due_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);


--
-- Name: idx_tasks_house; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_house ON public.tasks USING btree (house_id);


--
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_tasks_tags; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_tags ON public.tasks USING gin (tags);


--
-- Name: idx_tasks_template; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_template ON public.tasks USING btree (template_id);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- Name: idx_users_house; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_users_house ON public.users USING btree (house_id);


--
-- Name: idx_users_name_gin; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_users_name_gin ON public.users USING gin (name public.gin_trgm_ops);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_vacations_dates; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_vacations_dates ON public.vacations USING btree (date_start, date_end);


--
-- Name: idx_vacations_user_dates; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_vacations_user_dates ON public.vacations USING btree (user_id, date_start, date_end);


--
-- Name: v_emergency_swap_summary _RETURN; Type: RULE; Schema: public; Owner: sigalit_user
--

CREATE OR REPLACE VIEW public.v_emergency_swap_summary AS
 SELECT esr.id,
    esr.original_guide_id,
    esr.date,
    esr.shift_type,
    esr.reason,
    esr.urgency_level,
    esr.created_at,
    esr.resolved_at,
    esr.resolution_type,
    esr.coordinator_id,
    u.name AS original_guide_name,
    coord.name AS coordinator_name,
    count(gch.id) AS contact_attempts,
    count(
        CASE
            WHEN ((gch.response)::text = 'accepted'::text) THEN 1
            ELSE NULL::integer
        END) AS acceptances,
    count(
        CASE
            WHEN ((gch.response)::text = 'declined'::text) THEN 1
            ELSE NULL::integer
        END) AS declines,
    (es.executed_at IS NOT NULL) AS was_executed
   FROM ((((public.emergency_swap_requests esr
     LEFT JOIN public.users u ON ((esr.original_guide_id = u.id)))
     LEFT JOIN public.users coord ON ((esr.coordinator_id = coord.id)))
     LEFT JOIN public.guide_contact_history gch ON ((esr.id = gch.emergency_id)))
     LEFT JOIN public.executed_swaps es ON ((esr.id = es.emergency_id)))
  GROUP BY esr.id, u.name, coord.name, es.executed_at;


--
-- Name: coordinator_rules update_coordinator_rules_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_coordinator_rules_updated_at BEFORE UPDATE ON public.coordinator_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schedule update_schedule_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON public.schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tasks update_template_usage_trigger; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_template_usage_trigger AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_template_usage();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workflow_status update_workflow_status_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_workflow_status_updated_at BEFORE UPDATE ON public.workflow_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_help_effectiveness ai_help_effectiveness_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_help_effectiveness
    ADD CONSTRAINT ai_help_effectiveness_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_scheduling_patterns ai_scheduling_patterns_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_scheduling_patterns
    ADD CONSTRAINT ai_scheduling_patterns_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.users(id);


--
-- Name: ai_suggestion_feedback ai_suggestion_feedback_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_suggestion_feedback
    ADD CONSTRAINT ai_suggestion_feedback_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: ai_suggestion_feedback ai_suggestion_feedback_emergency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_suggestion_feedback
    ADD CONSTRAINT ai_suggestion_feedback_emergency_id_fkey FOREIGN KEY (emergency_id) REFERENCES public.emergency_swap_requests(id);


--
-- Name: ai_suggestion_feedback ai_suggestion_feedback_suggestion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_suggestion_feedback
    ADD CONSTRAINT ai_suggestion_feedback_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES public.ai_swap_suggestions(id);


--
-- Name: ai_swap_suggestions ai_swap_suggestions_emergency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.ai_swap_suggestions
    ADD CONSTRAINT ai_swap_suggestions_emergency_id_fkey FOREIGN KEY (emergency_id) REFERENCES public.emergency_swap_requests(id);


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: constraints constraints_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id);


--
-- Name: constraints constraints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.constraints
    ADD CONSTRAINT constraints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coordinator_rules coordinator_rules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.coordinator_rules
    ADD CONSTRAINT coordinator_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET DEFAULT;


--
-- Name: coordinator_rules coordinator_rules_guide1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.coordinator_rules
    ADD CONSTRAINT coordinator_rules_guide1_id_fkey FOREIGN KEY (guide1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coordinator_rules coordinator_rules_guide2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.coordinator_rules
    ADD CONSTRAINT coordinator_rules_guide2_id_fkey FOREIGN KEY (guide2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: drafts drafts_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.drafts
    ADD CONSTRAINT drafts_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: drafts drafts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.drafts
    ADD CONSTRAINT drafts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: email_logs email_logs_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: emergency_swap_requests emergency_swap_requests_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.emergency_swap_requests
    ADD CONSTRAINT emergency_swap_requests_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: emergency_swap_requests emergency_swap_requests_original_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.emergency_swap_requests
    ADD CONSTRAINT emergency_swap_requests_original_guide_id_fkey FOREIGN KEY (original_guide_id) REFERENCES public.users(id);


--
-- Name: executed_swaps executed_swaps_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.executed_swaps
    ADD CONSTRAINT executed_swaps_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: executed_swaps executed_swaps_emergency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.executed_swaps
    ADD CONSTRAINT executed_swaps_emergency_id_fkey FOREIGN KEY (emergency_id) REFERENCES public.emergency_swap_requests(id);


--
-- Name: fixed_constraints fixed_constraints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.fixed_constraints
    ADD CONSTRAINT fixed_constraints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guide_availability guide_availability_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_availability
    ADD CONSTRAINT guide_availability_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guide_contact_history guide_contact_history_contacted_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history
    ADD CONSTRAINT guide_contact_history_contacted_guide_id_fkey FOREIGN KEY (contacted_guide_id) REFERENCES public.users(id);


--
-- Name: guide_contact_history guide_contact_history_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history
    ADD CONSTRAINT guide_contact_history_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: guide_contact_history guide_contact_history_emergency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history
    ADD CONSTRAINT guide_contact_history_emergency_id_fkey FOREIGN KEY (emergency_id) REFERENCES public.emergency_swap_requests(id);


--
-- Name: guide_contact_history guide_contact_history_suggestion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_contact_history
    ADD CONSTRAINT guide_contact_history_suggestion_id_fkey FOREIGN KEY (suggestion_id) REFERENCES public.ai_swap_suggestions(id);


--
-- Name: guide_preferences guide_preferences_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_preferences
    ADD CONSTRAINT guide_preferences_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: official_schedules official_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.official_schedules
    ADD CONSTRAINT official_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule schedule_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule_draft schedule_draft_guide1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_draft
    ADD CONSTRAINT schedule_draft_guide1_id_fkey FOREIGN KEY (guide1_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule_draft schedule_draft_guide2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_draft
    ADD CONSTRAINT schedule_draft_guide2_id_fkey FOREIGN KEY (guide2_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule schedule_guide1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_guide1_id_fkey FOREIGN KEY (guide1_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule schedule_guide2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_guide2_id_fkey FOREIGN KEY (guide2_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule_history schedule_history_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule_history
    ADD CONSTRAINT schedule_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule schedule_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id);


--
-- Name: scheduling_rules scheduling_rules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.scheduling_rules
    ADD CONSTRAINT scheduling_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: scheduling_rules scheduling_rules_guide2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.scheduling_rules
    ADD CONSTRAINT scheduling_rules_guide2_id_fkey FOREIGN KEY (guide2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scheduling_rules scheduling_rules_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.scheduling_rules
    ADD CONSTRAINT scheduling_rules_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_handover_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_handover_guide_id_fkey FOREIGN KEY (handover_guide_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shifts shifts_regular_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_regular_guide_id_fkey FOREIGN KEY (regular_guide_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: task_templates task_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.task_templates
    ADD CONSTRAINT task_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_closed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_closed_by_id_fkey FOREIGN KEY (closed_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id);


--
-- Name: tasks tasks_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.task_templates(id) ON DELETE SET NULL;


--
-- Name: user_interaction_patterns user_interaction_patterns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.user_interaction_patterns
    ADD CONSTRAINT user_interaction_patterns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_house_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_house_id_fkey FOREIGN KEY (house_id) REFERENCES public.houses(id);


--
-- Name: vacations vacations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_status workflow_status_finalized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.workflow_status
    ADD CONSTRAINT workflow_status_finalized_by_fkey FOREIGN KEY (finalized_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_out(public.gtrgm); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO sigalit_user;


--
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO sigalit_user;


--
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO sigalit_user;


--
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO sigalit_user;


--
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_same(public.gtrgm, public.gtrgm, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO sigalit_user;


--
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO sigalit_user;


--
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.set_limit(real) TO sigalit_user;


--
-- Name: FUNCTION show_limit(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.show_limit() TO sigalit_user;


--
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.show_trgm(text) TO sigalit_user;


--
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.similarity(text, text) TO sigalit_user;


--
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO sigalit_user;


--
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.similarity_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO sigalit_user;


--
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO sigalit_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO sigalit_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO sigalit_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO sigalit_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO sigalit_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_nil() TO sigalit_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO sigalit_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO sigalit_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO sigalit_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO sigalit_user;


--
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.word_similarity(text, text) TO sigalit_user;


--
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO sigalit_user;


--
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO sigalit_user;


--
-- Name: TABLE doctor_referrals; Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON TABLE public.doctor_referrals TO sigalit_user;


--
-- Name: SEQUENCE doctor_referrals_id_seq; Type: ACL; Schema: public; Owner: dvirhillelcoheneraki
--

GRANT ALL ON SEQUENCE public.doctor_referrals_id_seq TO sigalit_user;


--
-- PostgreSQL database dump complete
--

