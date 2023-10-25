import { useState, useEffect } from "react";
import { fetchCategories, fetchTags } from "../FirebaseHelpers";

export const useCategoriesAndTags = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchTags().then(setTags);
  }, []);

  return {
    categories,
    setCategories,
    tags,
    setTags,
  };
};
