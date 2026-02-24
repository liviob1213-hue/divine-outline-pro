
-- Table for 640 hymns from Harpa Cristã
CREATE TABLE public.hinos (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  coro TEXT,
  letra_completa TEXT NOT NULL
);

ALTER TABLE public.hinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hinos are publicly readable"
ON public.hinos FOR SELECT USING (true);

-- Full-text search index on hymns
ALTER TABLE public.hinos ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(titulo, '') || ' ' || coalesce(coro, '') || ' ' || coalesce(letra_completa, ''))
  ) STORED;

CREATE INDEX idx_hinos_search ON public.hinos USING GIN(search_vector);

-- Table for 13 Bible versions
CREATE TABLE public.biblias (
  id BIGSERIAL PRIMARY KEY,
  versao TEXT NOT NULL,
  livro_id INTEGER NOT NULL,
  capitulo INTEGER NOT NULL,
  versiculo INTEGER NOT NULL,
  texto TEXT NOT NULL
);

ALTER TABLE public.biblias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bible verses are publicly readable"
ON public.biblias FOR SELECT USING (true);

-- Indexes for fast Bible lookups
CREATE INDEX idx_biblias_lookup ON public.biblias (versao, livro_id, capitulo);
CREATE INDEX idx_biblias_search ON public.biblias USING GIN(to_tsvector('portuguese', texto));

-- Mapping table for book names to IDs
CREATE TABLE public.livros_biblia (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  testamento TEXT NOT NULL CHECK (testamento IN ('AT', 'NT'))
);

ALTER TABLE public.livros_biblia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bible books are publicly readable"
ON public.livros_biblia FOR SELECT USING (true);

-- Insert book name mappings
INSERT INTO public.livros_biblia (id, nome, testamento) VALUES
(1,'Gênesis','AT'),(2,'Êxodo','AT'),(3,'Levítico','AT'),(4,'Números','AT'),(5,'Deuteronômio','AT'),
(6,'Josué','AT'),(7,'Juízes','AT'),(8,'Rute','AT'),(9,'1 Samuel','AT'),(10,'2 Samuel','AT'),
(11,'1 Reis','AT'),(12,'2 Reis','AT'),(13,'1 Crônicas','AT'),(14,'2 Crônicas','AT'),(15,'Esdras','AT'),
(16,'Neemias','AT'),(17,'Ester','AT'),(18,'Jó','AT'),(19,'Salmos','AT'),(20,'Provérbios','AT'),
(21,'Eclesiastes','AT'),(22,'Cânticos','AT'),(23,'Isaías','AT'),(24,'Jeremias','AT'),(25,'Lamentações','AT'),
(26,'Ezequiel','AT'),(27,'Daniel','AT'),(28,'Oséias','AT'),(29,'Joel','AT'),(30,'Amós','AT'),
(31,'Obadias','AT'),(32,'Jonas','AT'),(33,'Miquéias','AT'),(34,'Naum','AT'),(35,'Habacuque','AT'),
(36,'Sofonias','AT'),(37,'Ageu','AT'),(38,'Zacarias','AT'),(39,'Malaquias','AT'),
(40,'Mateus','NT'),(41,'Marcos','NT'),(42,'Lucas','NT'),(43,'João','NT'),(44,'Atos','NT'),
(45,'Romanos','NT'),(46,'1 Coríntios','NT'),(47,'2 Coríntios','NT'),(48,'Gálatas','NT'),
(49,'Efésios','NT'),(50,'Filipenses','NT'),(51,'Colossenses','NT'),(52,'1 Tessalonicenses','NT'),
(53,'2 Tessalonicenses','NT'),(54,'1 Timóteo','NT'),(55,'2 Timóteo','NT'),(56,'Tito','NT'),
(57,'Filemom','NT'),(58,'Hebreus','NT'),(59,'Tiago','NT'),(60,'1 Pedro','NT'),(61,'2 Pedro','NT'),
(62,'1 João','NT'),(63,'2 João','NT'),(64,'3 João','NT'),(65,'Judas','NT'),(66,'Apocalipse','NT');
