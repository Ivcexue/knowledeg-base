interface IText {
  text: string
}
interface IImage {
  image: string
}
interface IVideo {
  video: string
}
type IContent = IText | IImage | IVideo;
interface EInput {
  contents: IContent[]
}
interface RInput {
  query: string;
  documents: string[];
}

interface RParameters {
  return_documents: boolean;
  top_n: number;
}

interface EData {
  model: string;
  input?: EInput;
  parameters?: any
}

interface RData {
  model: string;
  input?: RInput;
  parameters?: RParameters
}


type EmbeddingsType = "text" | "image" | "video";
interface Embeddings {
  index: number;
  embedding: number[];
  type: EmbeddingsType
}
interface EmbeddingsOutput {
  output: {
    embeddings: Embeddings[];
  };
  usage: {
    input_tokens: number;
    image_count: number;
    duration: number;
  };

  request_id: string;
}

interface Reranks {
  document: {
    text: string
  }
  index: number;
  relevance_score: number;
}

interface RerankOutput {
  output: {
    results: Reranks[];
  };
  usage: {
    total_tokens: number;
  };
  request_id: string;
}

interface QdrantResult {
    id: string | number;
    version: number;
    score: number;
    payload?: Record<string, unknown> | {
        [key: string]: unknown;
    } | null | undefined;
    vector?: Record<string, unknown> | number[] | number[][] | {
        [key: string]: number[] | number[][] | {
            indices: number[];
            values: number[];
        } | undefined;
    } | null | undefined;
    shard_key?: string | number | Record<string, unknown> | null | undefined;
    order_value?: number | Record<string, unknown> | null | undefined;
}

interface RerankedResult {
  index: string | number;
  relevance_score: number;
  document?: Record<string, unknown> | {
      [key: string]: unknown;
  } | null | undefined;
}
