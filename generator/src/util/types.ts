export type Item = {
  name: string;
  description: string;
};

export type Ending = {
  id: number;
  ending_description: string;
};

export type PathCompletion = {
  type: "path";
  area_id: string;
};

export type ItemCompletion = {
  type: "item";
  item_name: string;
};

export type EndCompletion = {
  type: "end";
  ending_id: number;
};

export type Interaction = {
  name: string;
  description: string;
  completion: PathCompletion | ItemCompletion | EndCompletion;
  required_item: string | null;
  completion_message: string;
};

export type Area = {
  name: string;
  description: string;
  paths: string[];
  interactions: Interaction[];
  items: string[];
};

export type Adventure = {
  title: string;
  endings: Ending[];
  items: Item[];
  areas: Area[];
  start_area: string;
  intro_text: string;
  thumbnail?: string;
  time_stamp?: number;
};
