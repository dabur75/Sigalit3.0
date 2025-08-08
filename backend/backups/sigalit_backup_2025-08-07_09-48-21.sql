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
    house_id character varying(50) DEFAULT 'dror'::character varying NOT NULL
);


ALTER TABLE public.tasks OWNER TO sigalit_user;

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
-- Name: drafts id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.drafts ALTER COLUMN id SET DEFAULT nextval('public.drafts_id_seq'::regclass);


--
-- Name: email_logs id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.email_logs ALTER COLUMN id SET DEFAULT nextval('public.email_logs_id_seq'::regclass);


--
-- Name: fixed_constraints id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.fixed_constraints ALTER COLUMN id SET DEFAULT nextval('public.fixed_constraints_id_seq'::regclass);


--
-- Name: guide_availability id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.guide_availability ALTER COLUMN id SET DEFAULT nextval('public.guide_availability_id_seq'::regclass);


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
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


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
-- Data for Name: assignment_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.assignment_types (id, name, description, hours_per_shift, salary_factor, is_active, created_at) FROM stdin;
1	רגיל	משמרת רגילה	24	1.00	t	2025-08-07 09:47:34.575984
2	חג	משמרת בחג	24	1.50	t	2025-08-07 09:47:34.575984
3	שבת	משמרת בשבת	24	1.30	t	2025-08-07 09:47:34.575984
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.audit_log (id, table_name, record_id, action, old_values, new_values, user_id, "timestamp", ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: constraints; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.constraints (id, user_id, type, date, details, house_id, created_at) FROM stdin;
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.conversation_participants (conversation_id, user_id) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.conversations (id, updated_at) FROM stdin;
\.


--
-- Data for Name: coordinator_rules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.coordinator_rules (id, rule_type, guide1_id, guide2_id, description, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: drafts; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.drafts (id, month, version, name, data, created_by, created_at, is_final, approved_at, approved_by) FROM stdin;
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.email_logs (id, month, draft_version, recipient_id, recipient_email, sent_at, status, email_content) FROM stdin;
\.


--
-- Data for Name: fixed_constraints; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.fixed_constraints (id, user_id, weekday, hour_start, hour_end, details, created_at) FROM stdin;
\.


--
-- Data for Name: guide_availability; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.guide_availability (id, guide_id, date, status, reason, override_enabled, created_at) FROM stdin;
\.


--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.houses (id, name, display_name, is_active, created_at) FROM stdin;
dror	דרור	דרור	t	2025-08-07 09:47:34.095288
havatzelet	חבצלת	חבצלת	t	2025-08-07 09:47:34.095288
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.messages (id, conversation_id, from_user_id, to_user_id, text, "timestamp") FROM stdin;
\.


--
-- Data for Name: official_schedules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.official_schedules (id, month, version, schedule_data, created_by, created_at, status, notes) FROM stdin;
\.


--
-- Data for Name: overrides_activities; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.overrides_activities (id, date, "time", title, category, facilitator, created_at) FROM stdin;
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.referrals (id, patient, reason, doctor, date, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.schedule (id, date, weekday, type, guide1_id, guide2_id, is_manual, is_locked, created_by, created_at, updated_at, guide1_name, guide1_role, guide2_name, guide2_role, house_id) FROM stdin;
\.


--
-- Data for Name: schedule_draft; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.schedule_draft (id, date, weekday, type, guide1_id, guide2_id, name, created_at) FROM stdin;
\.


--
-- Data for Name: schedule_history; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.schedule_history (id, month, schedule_type, version, schedule_data, created_by, created_at, action, notes) FROM stdin;
\.


--
-- Data for Name: scheduling_rules; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.scheduling_rules (id, type, guide_id, guide2_id, created_by, created_at, description) FROM stdin;
\.


--
-- Data for Name: shabbat_status; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.shabbat_status (date, status, created_at) FROM stdin;
\.


--
-- Data for Name: shift_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.shift_types (id, name, description, guides_required, roles_required, is_active, created_at) FROM stdin;
1	רגיל	משמרת רגילה	2	["מדריך", "מדריך"]	t	2025-08-07 09:47:34.57798
2	רכז	משמרת עם רכז	2	["רכז", "מדריך"]	t	2025-08-07 09:47:34.57798
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.shifts (id, date, day, handover_guide_id, regular_guide_id, created_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.tasks (id, text, created_at, creator_id, assigned_to_id, status, shift_date, notes, closed_by_id, closed_at, house_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.users (id, name, role, password, email, phone, percent, is_active, created_at, updated_at, house_id, accessible_houses) FROM stdin;
1	יוסי כהן	מדריך	\N	\N	\N	\N	t	2025-08-07 09:48:06.728823	2025-08-07 09:48:06.728823	dror	["dror", "havatzelet"]
\.


--
-- Data for Name: vacations; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.vacations (id, user_id, date_start, date_end, note, status, response_note, created_at) FROM stdin;
\.


--
-- Data for Name: weekend_types; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.weekend_types (id, date, is_closed, created_at) FROM stdin;
\.


--
-- Data for Name: weekly_activities; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.weekly_activities (id, weekday, "time", duration, title, category, facilitator, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_status; Type: TABLE DATA; Schema: public; Owner: sigalit_user
--

COPY public.workflow_status (month, current_draft_version, is_finalized, finalized_at, finalized_by, last_email_sent_version, last_email_sent_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: assignment_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.assignment_types_id_seq', 3, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 1, false);


--
-- Name: constraints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.constraints_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: coordinator_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.coordinator_rules_id_seq', 1, false);


--
-- Name: drafts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.drafts_id_seq', 1, false);


--
-- Name: email_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.email_logs_id_seq', 1, false);


--
-- Name: fixed_constraints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.fixed_constraints_id_seq', 1, false);


--
-- Name: guide_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.guide_availability_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: official_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.official_schedules_id_seq', 1, false);


--
-- Name: overrides_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.overrides_activities_id_seq', 1, false);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- Name: schedule_draft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_draft_id_seq', 1, false);


--
-- Name: schedule_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_history_id_seq', 1, false);


--
-- Name: schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.schedule_id_seq', 1, false);


--
-- Name: scheduling_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.scheduling_rules_id_seq', 1, false);


--
-- Name: shift_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.shift_types_id_seq', 2, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.shifts_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: vacations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.vacations_id_seq', 1, false);


--
-- Name: weekend_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.weekend_types_id_seq', 1, false);


--
-- Name: weekly_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sigalit_user
--

SELECT pg_catalog.setval('public.weekly_activities_id_seq', 1, false);


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
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: sigalit_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


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
-- Name: idx_coordinator_rules_guides; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_coordinator_rules_guides ON public.coordinator_rules USING btree (guide1_id, guide2_id, is_active);


--
-- Name: idx_coordinator_rules_type; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_coordinator_rules_type ON public.coordinator_rules USING btree (rule_type, is_active);


--
-- Name: idx_fixed_constraints_user_weekday; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_fixed_constraints_user_weekday ON public.fixed_constraints USING btree (user_id, weekday);


--
-- Name: idx_guide_availability_guide_date; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_guide_availability_guide_date ON public.guide_availability USING btree (guide_id, date);


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
-- Name: idx_tasks_assigned; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_assigned ON public.tasks USING btree (assigned_to_id);


--
-- Name: idx_tasks_house; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_house ON public.tasks USING btree (house_id);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: sigalit_user
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


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
-- Name: coordinator_rules update_coordinator_rules_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_coordinator_rules_updated_at BEFORE UPDATE ON public.coordinator_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schedule update_schedule_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON public.schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workflow_status update_workflow_status_updated_at; Type: TRIGGER; Schema: public; Owner: sigalit_user
--

CREATE TRIGGER update_workflow_status_updated_at BEFORE UPDATE ON public.workflow_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


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
-- Name: monthly_schedule_stats; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: sigalit_user
--

REFRESH MATERIALIZED VIEW public.monthly_schedule_stats;


--
-- PostgreSQL database dump complete
--

