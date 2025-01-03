PGDMP  /                
    |            postgres    17.0    17.2 7    ;           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            <           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            =           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            >           1262    5    postgres    DATABASE     �   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE postgres;
                     postgres    false            ?           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                        postgres    false    4926                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     pg_database_owner    false            @           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                        pg_database_owner    false    4            �            1259    16457    comment    TABLE     �   CREATE TABLE public.comment (
    id integer NOT NULL,
    content text NOT NULL,
    create_at date NOT NULL,
    user_id integer NOT NULL,
    task_id integer NOT NULL
);
    DROP TABLE public.comment;
       public         heap r       postgres    false    4            �            1259    16456    comment_id_seq    SEQUENCE     �   ALTER TABLE public.comment ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    4    228            �            1259    16439    document    TABLE     �   CREATE TABLE public.document (
    id integer NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text,
    file_size integer,
    uploaded_date date NOT NULL,
    user_id integer NOT NULL,
    task_id integer NOT NULL
);
    DROP TABLE public.document;
       public         heap r       postgres    false    4            �            1259    16438    document_id_seq    SEQUENCE     �   ALTER TABLE public.document ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    4    226            �            1259    16399    group    TABLE     �   CREATE TABLE public."group" (
    id integer NOT NULL,
    name text NOT NULL,
    create_at date NOT NULL,
    updated_at date NOT NULL,
    description text
);
    DROP TABLE public."group";
       public         heap r       postgres    false    4            �            1259    16411    group_id_seq    SEQUENCE     �   ALTER TABLE public."group" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    4    218            �            1259    16474    has_project    TABLE     �   CREATE TABLE public.has_project (
    group_id integer NOT NULL,
    project_id integer NOT NULL,
    added_at date NOT NULL
);
    DROP TABLE public.has_project;
       public         heap r       postgres    false    4            �            1259    16484    is_assigned_task    TABLE     �   CREATE TABLE public.is_assigned_task (
    user_id integer NOT NULL,
    task_id integer NOT NULL,
    role text,
    assigned_at date NOT NULL
);
 $   DROP TABLE public.is_assigned_task;
       public         heap r       postgres    false    4            �            1259    16413    project    TABLE     �   CREATE TABLE public.project (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    status integer DEFAULT 0
);
    DROP TABLE public.project;
       public         heap r       postgres    false    4            �            1259    16422    project_id_seq    SEQUENCE     �   ALTER TABLE public.project ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    221    4            �            1259    16424    task    TABLE     .  CREATE TABLE public.task (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    due_date date NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    project_id integer NOT NULL
);
    DROP TABLE public.task;
       public         heap r       postgres    false    4            �            1259    16423    task_id_seq    SEQUENCE     �   ALTER TABLE public.task ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    224    4            �            1259    16388    user    TABLE     /  CREATE TABLE public."user" (
    id integer NOT NULL,
    firstname text,
    lastname text,
    dateofbirth date,
    username text NOT NULL,
    password_hash text NOT NULL,
    email text NOT NULL,
    status boolean DEFAULT false NOT NULL,
    group_id integer,
    role text,
    joined_at date
);
    DROP TABLE public."user";
       public         heap r       postgres    false    4            �            1259    16412    user_id_seq    SEQUENCE     �   ALTER TABLE public."user" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public               postgres    false    4    217            6          0    16457    comment 
   TABLE DATA           K   COPY public.comment (id, content, create_at, user_id, task_id) FROM stdin;
    public               postgres    false    228    A       4          0    16439    document 
   TABLE DATA           s   COPY public.document (id, file_name, file_path, file_type, file_size, uploaded_date, user_id, task_id) FROM stdin;
    public               postgres    false    226   EA       ,          0    16399    group 
   TABLE DATA           O   COPY public."group" (id, name, create_at, updated_at, description) FROM stdin;
    public               postgres    false    218   �A       7          0    16474    has_project 
   TABLE DATA           E   COPY public.has_project (group_id, project_id, added_at) FROM stdin;
    public               postgres    false    229   �A       8          0    16484    is_assigned_task 
   TABLE DATA           O   COPY public.is_assigned_task (user_id, task_id, role, assigned_at) FROM stdin;
    public               postgres    false    230   B       /          0    16413    project 
   TABLE DATA           n   COPY public.project (id, name, description, start_date, end_date, created_at, updated_at, status) FROM stdin;
    public               postgres    false    221   DB       2          0    16424    task 
   TABLE DATA           v   COPY public.task (id, title, description, due_date, created_at, updated_at, status, priority, project_id) FROM stdin;
    public               postgres    false    224   �B       +          0    16388    user 
   TABLE DATA           �   COPY public."user" (id, firstname, lastname, dateofbirth, username, password_hash, email, status, group_id, role, joined_at) FROM stdin;
    public               postgres    false    217   �B       A           0    0    comment_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.comment_id_seq', 1, true);
          public               postgres    false    227            B           0    0    document_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.document_id_seq', 2, true);
          public               postgres    false    225            C           0    0    group_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.group_id_seq', 3, true);
          public               postgres    false    219            D           0    0    project_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.project_id_seq', 1, true);
          public               postgres    false    222            E           0    0    task_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.task_id_seq', 1, true);
          public               postgres    false    223            F           0    0    user_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.user_id_seq', 5, true);
          public               postgres    false    220            �           2606    16490    is_assigned_task assigned_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.is_assigned_task
    ADD CONSTRAINT assigned_pkey PRIMARY KEY (user_id, task_id);
 H   ALTER TABLE ONLY public.is_assigned_task DROP CONSTRAINT assigned_pkey;
       public                 postgres    false    230    230            �           2606    16463    comment comment_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.comment DROP CONSTRAINT comment_pkey;
       public                 postgres    false    228            �           2606    16445    document document_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.document DROP CONSTRAINT document_pkey;
       public                 postgres    false    226            }           2606    16398 
   user email 
   CONSTRAINT     H   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT email UNIQUE (email);
 6   ALTER TABLE ONLY public."user" DROP CONSTRAINT email;
       public                 postgres    false    217            �           2606    16405    group group_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."group" DROP CONSTRAINT group_pkey;
       public                 postgres    false    218            �           2606    16478    has_project has_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.has_project
    ADD CONSTRAINT has_pkey PRIMARY KEY (group_id, project_id);
 >   ALTER TABLE ONLY public.has_project DROP CONSTRAINT has_pkey;
       public                 postgres    false    229    229            �           2606    16420    project project_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.project DROP CONSTRAINT project_pkey;
       public                 postgres    false    221            �           2606    16432    task task_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.task DROP CONSTRAINT task_pkey;
       public                 postgres    false    224                       2606    16394    user user_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_pkey;
       public                 postgres    false    217            �           2606    16396    user username 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT username UNIQUE (username);
 9   ALTER TABLE ONLY public."user" DROP CONSTRAINT username;
       public                 postgres    false    217            �           2606    16491 #   is_assigned_task assigned_user_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.is_assigned_task
    ADD CONSTRAINT assigned_user_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
 M   ALTER TABLE ONLY public.is_assigned_task DROP CONSTRAINT assigned_user_fkey;
       public               postgres    false    4735    230    217            �           2606    16451    document comment_task_fkey    FK CONSTRAINT     x   ALTER TABLE ONLY public.document
    ADD CONSTRAINT comment_task_fkey FOREIGN KEY (task_id) REFERENCES public.task(id);
 D   ALTER TABLE ONLY public.document DROP CONSTRAINT comment_task_fkey;
       public               postgres    false    224    4743    226            �           2606    16469    comment comment_task_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_task_fkey FOREIGN KEY (task_id) REFERENCES public.task(id);
 C   ALTER TABLE ONLY public.comment DROP CONSTRAINT comment_task_fkey;
       public               postgres    false    224    228    4743            �           2606    16446    document comment_user_fkey    FK CONSTRAINT     z   ALTER TABLE ONLY public.document
    ADD CONSTRAINT comment_user_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
 D   ALTER TABLE ONLY public.document DROP CONSTRAINT comment_user_fkey;
       public               postgres    false    4735    226    217            �           2606    16464    comment comment_user_fkey    FK CONSTRAINT     y   ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
 C   ALTER TABLE ONLY public.comment DROP CONSTRAINT comment_user_fkey;
       public               postgres    false    4735    217    228            �           2606    16406    user group_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT group_fkey FOREIGN KEY (group_id) REFERENCES public."group"(id) NOT VALID;
 ;   ALTER TABLE ONLY public."user" DROP CONSTRAINT group_fkey;
       public               postgres    false    217    218    4739            �           2606    16501    has_project group_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.has_project
    ADD CONSTRAINT group_fkey FOREIGN KEY (group_id) REFERENCES public."group"(id) NOT VALID;
 @   ALTER TABLE ONLY public.has_project DROP CONSTRAINT group_fkey;
       public               postgres    false    218    229    4739            �           2606    16506    has_project project_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.has_project
    ADD CONSTRAINT project_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) NOT VALID;
 B   ALTER TABLE ONLY public.has_project DROP CONSTRAINT project_fkey;
       public               postgres    false    229    4741    221            �           2606    16433    task task_fkey    FK CONSTRAINT     r   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_fkey FOREIGN KEY (project_id) REFERENCES public.project(id);
 8   ALTER TABLE ONLY public.task DROP CONSTRAINT task_fkey;
       public               postgres    false    221    4741    224            �           2606    16496    is_assigned_task task_fkey    FK CONSTRAINT     x   ALTER TABLE ONLY public.is_assigned_task
    ADD CONSTRAINT task_fkey FOREIGN KEY (task_id) REFERENCES public.task(id);
 D   ALTER TABLE ONLY public.is_assigned_task DROP CONSTRAINT task_fkey;
       public               postgres    false    230    224    4743            6   5   x�3�,�W�H,J�QH�T�I�U��W(���4202�54�5��4�4����� !{
�      4   7   x�3�L,�t�O��/H,��/J-�/-JN��!##]CC]#N#NC�=... w��      ,   G   x�3�tJL�N�K�4202�54�5�@fBe\R˸�8݊��Jp+�I�Us�&e��d��P������ �J�      7      x�3�4�4202�54�5��2B���qqq e0�      8   "   x�3�4���4202�54�5��2������ ���      /   K   x�3�O��q��K�,(��JM.Q�M�KLO�M�+QH,(�4202�5��50�0�t����PQC]#N�=... K�      2   N   x�3���-�I�M�+Q(�L�+-�L,Ȅ2��J�SADf^��H ����������!�i�kd��4�4�4����� eC�      +   �   x�m�;�0@g��@�����b��Z� ��F��I[��g�����p�x����$��f �N�.�F����`0��b�j�-76�	l]�yPԲz��O�L�h�L#q#28:��Άn]��rͻ3���k�ɶ��*J�k�b��ZǊ^R�cO�:��;)!��ZR�     