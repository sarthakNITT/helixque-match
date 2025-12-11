// language: "English",
// domain: "Frontend",
// techStack: ["React", "Node"],
// experience: "1-3",
// country: "IN",

export interface UserPreferences {
  techStack: string | string[];
  language: string | string[];
  experience: string | string[];
  domain: string | string[];
  country: string | string[];
}

export const BuildSignature = async (props: UserPreferences) => {
  const language = Check(props.language);
  const domain = Check(props.domain);
  const techStack = Check(props.techStack);
  const experience = Check(props.experience);
  const country = Check(props.country);
  const key = `language:${language}|domain:${domain}|techStack:${techStack}|experience:${experience}|country:${country}`;
  return key;
};

function Check(v: string | string[]) {
  if (Array.isArray(v)) {
    return v
      .map((x) => String(x).toLowerCase())
      .sort((a, b) => a.localeCompare(b))
      .join(",");
  }
  return String(v).toLowerCase();
}
