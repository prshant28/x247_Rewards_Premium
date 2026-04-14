--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_sessions (
    id integer NOT NULL,
    token text NOT NULL,
    admin_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_sessions_id_seq OWNED BY public.admin_sessions.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clicks (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    ip_hash text,
    user_agent text,
    referrer text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clicks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clicks_id_seq OWNED BY public.clicks.id;


--
-- Name: contests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contests (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    prize text NOT NULL,
    prize_value text,
    max_spots integer DEFAULT 100 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    image_url text,
    slug text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    ends_at timestamp without time zone,
    partner_ids json DEFAULT '[]'::json
);


--
-- Name: contests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contests_id_seq OWNED BY public.contests.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: form_fills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_fills (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    ip_hash text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: form_fills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_fills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_fills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_fills_id_seq OWNED BY public.form_fills.id;


--
-- Name: giveaway_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.giveaway_entries (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    age integer NOT NULL,
    city text NOT NULL,
    completed_partners json NOT NULL,
    screenshot_confirmed boolean DEFAULT false NOT NULL,
    agreed_to_terms boolean DEFAULT false NOT NULL,
    ip_hash text,
    entry_count integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    screenshot_url text,
    entry_code text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    contest_id integer,
    user_id integer
);


--
-- Name: giveaway_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.giveaway_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: giveaway_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.giveaway_entries_id_seq OWNED BY public.giveaway_entries.id;


--
-- Name: impressions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.impressions (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    ip_hash text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: impressions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.impressions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: impressions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.impressions_id_seq OWNED BY public.impressions.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    tagline text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'Registration'::text NOT NULL,
    registration_url text NOT NULL,
    accent text DEFAULT 'navy'::text NOT NULL,
    badge text,
    badge_secondary text,
    is_active boolean DEFAULT false NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    entry_points integer DEFAULT 1 NOT NULL
);


--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- Name: partners_sort_order_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partners_sort_order_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partners_sort_order_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partners_sort_order_seq OWNED BY public.partners.sort_order;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    token text NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    city text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: winners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.winners (
    id integer NOT NULL,
    contest_id integer NOT NULL,
    entry_id integer,
    winner_name text NOT NULL,
    winner_city text,
    prize text NOT NULL,
    entry_code text,
    announced_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: winners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.winners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: winners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.winners_id_seq OWNED BY public.winners.id;


--
-- Name: admin_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions ALTER COLUMN id SET DEFAULT nextval('public.admin_sessions_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: clicks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clicks ALTER COLUMN id SET DEFAULT nextval('public.clicks_id_seq'::regclass);


--
-- Name: contests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contests ALTER COLUMN id SET DEFAULT nextval('public.contests_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: form_fills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fills ALTER COLUMN id SET DEFAULT nextval('public.form_fills_id_seq'::regclass);


--
-- Name: giveaway_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giveaway_entries ALTER COLUMN id SET DEFAULT nextval('public.giveaway_entries_id_seq'::regclass);


--
-- Name: impressions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impressions ALTER COLUMN id SET DEFAULT nextval('public.impressions_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- Name: partners sort_order; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners ALTER COLUMN sort_order SET DEFAULT nextval('public.partners_sort_order_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: winners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.winners ALTER COLUMN id SET DEFAULT nextval('public.winners_id_seq'::regclass);


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_sessions (id, token, admin_id, expires_at, created_at) FROM stdin;
1	6853b5ba41e3cc449c4a8980fb69a30a17308c268edc3327ed5392f225d7256fc2f2b7ebd595d1407c8bd922f1efe3f7	1	2026-04-14 09:08:46.766	2026-04-13 09:08:46.766928
2	9b774a0d1332a57ce2266c6ec7316f555098df53a47e6846e98336fa2f5ab1c5d7829bc791d354fccec825c85d39349c	1	2026-04-14 09:12:20.565	2026-04-13 09:12:20.56604
3	762ed6294f414f4f0c5ed1e49b8c4305a03b92aea28c7b3d1c6aeabe962107883f7226a4b99fecf297b7558cf392c4de	1	2026-04-14 09:27:18.859	2026-04-13 09:27:18.860402
4	20f1523bdf53e734990c38ef1beaf0849a08a9fce253baa6740dc4eaed312b27545b0bdfffeda0244de66b6108a6c646	1	2026-04-14 09:29:12.619	2026-04-13 09:29:12.620958
5	8047b29540022af1edf6877f4810def61473c118b42d5a8fb81d790fc79c202c8add03eafb53e8857145505849859bab	1	2026-04-14 09:29:18.211	2026-04-13 09:29:18.211905
6	d084f0fb01066b72f60bcaa0063705dc162801653a6e7e97022647c3f9f32777778b03ddaa08493cea0288194ddf9fdc	1	2026-04-14 09:30:46.617	2026-04-13 09:30:46.617774
7	7b0814c73914a077851cebe81f72121378f60cc10186d6123935b0cea389e05d21a95bd1cbe7c65b6eaa57ff432bfc8e	1	2026-04-14 12:53:16.023	2026-04-13 12:53:16.024915
8	87734e28a87aa5463c0b48521a59770d09ee60b380c66ca7c411731be04a5ef8476544061100645bc84b34126619b513	1	2026-04-14 12:54:04.362	2026-04-13 12:54:04.363792
9	851cc8c530110f8dc43275d8b2abe833ad4a4a645226de91dc522329ab988d8b91a8666a6956275679194f97cd998fd0	1	2026-04-14 12:58:27.343	2026-04-13 12:58:27.344116
10	628a8c3f027c690856b1de949fc802770920ff17dade4c1e78784de78be151bd8c68dfd6c3114c818ac65fb2e6665d6e	1	2026-04-14 12:59:27.134	2026-04-13 12:59:27.135633
11	06d0c4eee523276e1466b5b38e4dcb6d28cbbf77dbec596ef2920236fa026215ad48101705916691dcae0a77b22598df	1	2026-04-14 13:00:43.276	2026-04-13 13:00:43.277118
12	6f95c28ca8c1791674f378d5e29acaf7f47e9d191feb7571c0065ca926717f8006b925af7e68e6579c1a8366b7a7f8b1	1	2026-04-14 13:05:12.814	2026-04-13 13:05:12.815983
13	7ff4bb5f87a57d1354f0b3b34b83edcbe08636b115e2b2416ad2c65a9ddc1f204717db57bfe09a73b33f30c2e7848305	1	2026-04-14 13:23:26.468	2026-04-13 13:23:26.470473
14	c5ace422e2443c51dcedd4df31093a996e85714972ac0fb86ff7ce7ec2f992a851f7d25014856ca27c5758278245e839	1	2026-04-15 07:53:56.559	2026-04-14 07:53:56.561141
15	26d37fe3eda13d095a18e4991639321723c02440308e0c2ad8a0f58eaaffad7c5c5583c2a2dd19c81291c6a2284f63ba	1	2026-04-15 07:56:01.696	2026-04-14 07:56:01.697864
16	42b888859abd8c3e297a1e58b107635e853a18ab0c2fb933472fa1a6a5ae8031ce1c776b234793958481b815e2c25486	1	2026-04-15 08:20:18.425	2026-04-14 08:20:18.426051
17	8da66a98b1a68a408c21f0a50f22c9a41cf94492846b59eba6f07f687bdb0511d0dcb387c5152b5fe060b7811c295c43	1	2026-04-15 08:34:07.367	2026-04-14 08:34:07.368024
18	d60d1cfe47833080fbe40d402846cd038077d59c288711bdf381a0c5e902baae039664a593a9b0a44af80a1a0500b3b4	1	2026-04-15 08:40:32.183	2026-04-14 08:40:32.184204
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, username, password_hash, created_at) FROM stdin;
1	ceo@prshant.dev	$2b$12$IzDCTSCYZDNejAY6mGjd6utcZNLcFFcWbrdQ5.McImxkmk7/GCRyq	2026-04-13 09:01:37.332201
\.


--
-- Data for Name: clicks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clicks (id, partner_id, ip_hash, user_agent, referrer, created_at) FROM stdin;
1	1	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-13 09:24:51.611288
2	1	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-13 09:25:06.902099
3	1	eff8e7ca506627fe	curl/8.14.1		2026-04-14 07:30:39.455689
4	2	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-14 07:58:55.918821
5	1	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-14 08:04:30.883066
6	1	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-14 08:37:30.164926
7	1	3e48ef9d22e096da	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	https://c524b1a4-1747-4cad-94a0-09c02daf7ccb-00-zxcsro7jzne.spock.replit.dev/partners	2026-04-14 08:46:36.483994
\.


--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contests (id, name, description, prize, prize_value, max_spots, status, image_url, slug, created_at, ends_at, partner_ids) FROM stdin;
1	Mega Cash Giveaway	Win big with our flagship cash prize giveaway! Complete partner registrations and stand a chance to win massive cash rewards.	₹50,000 Cash Prize	₹50,000	100	active	\N	mega-cash-giveaway	2026-04-13 15:20:04.083782	\N	[]
2	Tech Gadgets Bonanza	Premium tech gadgets up for grabs! Register with our partner platforms and enter to win the latest smartphones, tablets, and accessories.	iPhone 16 Pro Max	₹1,44,900	100	active	\N	tech-gadgets-bonanza	2026-04-13 15:20:04.088461	\N	[]
3	Gaming Paradise	Gamers unite! Win exclusive gaming gear including consoles, controllers, and gaming accessories.	PS5 + Gaming Bundle	₹65,000	100	active	\N	gaming-paradise	2026-04-13 15:20:04.09177	\N	[]
4	Student Special	Exclusively for students! Complete registrations on student-only partner platforms and win amazing prizes tailored for students.	Laptop + Study Kit	₹45,000	50	active	\N	student-special	2026-04-13 15:20:04.094496	\N	[]
5	Weekend Flash Contest	Limited time flash contest! Quick entries, instant excitement. Complete just 2 partner registrations to enter.	₹10,000 Instant Cash	₹10,000	25	upcoming	\N	weekend-flash	2026-04-13 15:20:04.097719	\N	[]
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, title, created_at) FROM stdin;
\.


--
-- Data for Name: form_fills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_fills (id, partner_id, ip_hash, created_at) FROM stdin;
\.


--
-- Data for Name: giveaway_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.giveaway_entries (id, full_name, email, phone, age, city, completed_partners, screenshot_confirmed, agreed_to_terms, ip_hash, entry_count, created_at, screenshot_url, entry_code, is_anonymous, contest_id, user_id) FROM stdin;
2	Test	prashantmaurya600@gmail.com	7618078806	18	Azamgarh	[1]	t	t	3e48ef9d22e096da	1	2026-04-13 14:49:56.520305	/objects/uploads/d374f3d1-b6fc-4576-9cdc-9c744f12addc	X247-3HGQ-5SMC	t	\N	\N
\.


--
-- Data for Name: impressions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.impressions (id, partner_id, ip_hash, created_at) FROM stdin;
1	1	3e48ef9d22e096da	2026-04-13 09:08:24.514354
2	1	3e48ef9d22e096da	2026-04-13 09:08:24.587128
3	1	3e48ef9d22e096da	2026-04-13 09:09:22.053573
4	1	3e48ef9d22e096da	2026-04-13 09:12:06.68203
5	1	3e48ef9d22e096da	2026-04-13 09:24:41.44411
6	1	3e48ef9d22e096da	2026-04-13 09:30:19.746645
7	1	3e48ef9d22e096da	2026-04-13 09:49:43.506559
8	1	3e48ef9d22e096da	2026-04-13 11:05:11.684304
9	1	3e48ef9d22e096da	2026-04-13 14:52:17.179944
10	1	3e48ef9d22e096da	2026-04-13 14:53:07.719185
11	1	3e48ef9d22e096da	2026-04-13 15:02:55.20246
12	1	3e48ef9d22e096da	2026-04-13 15:07:25.176457
13	1	3e48ef9d22e096da	2026-04-14 03:58:18.67319
14	1	3e48ef9d22e096da	2026-04-14 04:25:57.161944
15	1	3e48ef9d22e096da	2026-04-14 06:28:29.575212
16	1	3e48ef9d22e096da	2026-04-14 06:35:14.258357
17	1	3e48ef9d22e096da	2026-04-14 06:42:20.438002
18	1	3e48ef9d22e096da	2026-04-14 07:26:30.094864
19	2	3e48ef9d22e096da	2026-04-14 07:57:59.977926
20	1	3e48ef9d22e096da	2026-04-14 07:57:59.978599
21	1	3e48ef9d22e096da	2026-04-14 07:58:32.173035
22	2	3e48ef9d22e096da	2026-04-14 07:58:32.174059
23	2	3e48ef9d22e096da	2026-04-14 08:03:46.892467
24	1	3e48ef9d22e096da	2026-04-14 08:03:46.894951
25	1	3e48ef9d22e096da	2026-04-14 08:29:00.853789
26	2	3e48ef9d22e096da	2026-04-14 08:29:01.912702
27	2	3e48ef9d22e096da	2026-04-14 08:34:53.561526
28	1	3e48ef9d22e096da	2026-04-14 08:34:53.562072
29	2	3e48ef9d22e096da	2026-04-14 08:46:29.696587
30	1	3e48ef9d22e096da	2026-04-14 08:46:29.736862
32	1	3e48ef9d22e096da	2026-04-14 12:08:37.712472
31	2	3e48ef9d22e096da	2026-04-14 12:08:37.711747
33	2	3e48ef9d22e096da	2026-04-14 12:18:19.180429
34	1	3e48ef9d22e096da	2026-04-14 12:18:19.185817
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, role, content, created_at) FROM stdin;
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partners (id, slug, name, tagline, description, category, registration_url, accent, badge, badge_secondary, is_active, is_required, sort_order, created_at, updated_at, entry_points) FROM stdin;
1	solution-challenge-2026	Solution Challenge 2026	Hack2Skill — Students Only	Register for the Google Solution Challenge 2026 on Hack2Skill. This is a nationwide hackathon by Google Developer Groups on Campus. Fill the complete registration form to earn your first giveaway entry. Open to students enrolled in university/college only (age 18+).	Registration	https://dub.sh/x247-partner-1	navy	Required	Students Only	t	t	1	2026-04-13 09:01:41.224886	2026-04-14 08:41:13.143	1
2	tenzorx-national-ai-hackathon	TenzorX 2026 National AI Hackathon	Compete in AI Hackathon	Join the TenzorX 2026 National AI Hackathon organized by Unstop and Poonawalla Fincorp. Showcase your AI skills and compete for exciting prizes. Register now and take part in this innovative competition.	Registration	https://dub.sh/x247-partner-2	navy	Popular	Students Only	t	t	2	2026-04-14 07:56:36.64439	2026-04-14 08:44:08.447	1
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, token, user_id, expires_at, created_at) FROM stdin;
1	2401c3fca8eb065a66ca5b1c3892553b4637365d5d6b5ae03a72794a4515b8f8	1	2026-05-14 06:41:14.571	2026-04-14 06:41:14.572411
2	ded76969bc61e45929264d4d11ee8512f4e6e8e89c691b5172c441f572339ac9	2	2026-05-14 07:09:39.094	2026-04-14 07:09:39.094909
3	5d4196876cb51272057494505049e093470bf089e2163dc51ac2736e0d3eac01	3	2026-05-14 07:11:02.212	2026-04-14 07:11:02.213838
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, full_name, email, phone, password_hash, city, created_at) FROM stdin;
1	Romish	user01@gmail.com	\N	$2b$10$DyxdLygVkaimj/MEJ.kH7ed7R3WyR/n3/u/XfzzSuhWA8jwG46oJy	\N	2026-04-14 06:41:14.538742
2	Test User	test-dropdown@test.com	\N	$2b$10$Rs8iIY2taHR/vXsPz5OAd.5oiKrCgNd83VRLZLg/6niqNb8CRipG2	\N	2026-04-14 07:09:38.869514
3	Avatar Tester	avatar-test-1776150626863@test.com	\N	$2b$10$Lpbq11Y46G9cP5Q/C49GN.N57t116P26uL8vVsDlmtUNgl4OVVUxO	\N	2026-04-14 07:11:02.177385
\.


--
-- Data for Name: winners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.winners (id, contest_id, entry_id, winner_name, winner_city, prize, entry_code, announced_at) FROM stdin;
1	1	\N	Rahul S.	Mumbai	₹50,000 Cash Prize	X247-AB3K-9F2M	2026-04-13 15:20:04.102887
2	2	\N	Priya K.	Delhi	iPhone 16 Pro Max	X247-CDE7-4H6N	2026-04-13 15:20:04.114749
3	1	\N	Amit R.	Bangalore	₹25,000 Cash Prize	X247-GH2J-8K5P	2026-04-13 15:20:04.118295
\.


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_sessions_id_seq', 18, true);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: clicks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clicks_id_seq', 7, true);


--
-- Name: contests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contests_id_seq', 5, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: form_fills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_fills_id_seq', 1, false);


--
-- Name: giveaway_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.giveaway_entries_id_seq', 2, true);


--
-- Name: impressions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.impressions_id_seq', 34, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partners_id_seq', 2, true);


--
-- Name: partners_sort_order_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partners_sort_order_seq', 2, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: winners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.winners_id_seq', 3, true);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: admin_sessions admin_sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_token_unique UNIQUE (token);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_unique UNIQUE (username);


--
-- Name: clicks clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_pkey PRIMARY KEY (id);


--
-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);


--
-- Name: contests contests_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_slug_unique UNIQUE (slug);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: form_fills form_fills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fills
    ADD CONSTRAINT form_fills_pkey PRIMARY KEY (id);


--
-- Name: giveaway_entries giveaway_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giveaway_entries
    ADD CONSTRAINT giveaway_entries_pkey PRIMARY KEY (id);


--
-- Name: impressions impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: partners partners_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_slug_unique UNIQUE (slug);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_unique UNIQUE (token);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: winners winners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.winners
    ADD CONSTRAINT winners_pkey PRIMARY KEY (id);


--
-- Name: clicks clicks_partner_id_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_partner_id_partners_id_fk FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: form_fills form_fills_partner_id_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fills
    ADD CONSTRAINT form_fills_partner_id_partners_id_fk FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: impressions impressions_partner_id_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_partner_id_partners_id_fk FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Xn5HRCHNDLhlD1sxUrtgHAHOFokusTfPLMC3W2gJwOBXJdfgLg0wbnMsIql7Pel

