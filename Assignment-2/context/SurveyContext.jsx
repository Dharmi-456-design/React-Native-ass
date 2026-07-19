import React, { createContext, useState, useContext } from 'react';























const SurveyContext = createContext(undefined);

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [draftSurvey, setDraftSurvey] = useState({});

  const addSurvey = (survey) => {
    setSurveys([...surveys, survey]);
  };

  const deleteSurvey = (id) => {
    setSurveys(surveys.filter((s) => s.id !== id));
  };

  const updateDraft = (updates) => {
    setDraftSurvey((prev) => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    setDraftSurvey({});
  };

  return (
    <SurveyContext.Provider value={{ surveys, addSurvey, deleteSurvey, draftSurvey, updateDraft, clearDraft }}>
      {children}
    </SurveyContext.Provider>);

};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) throw new Error('useSurvey must be used within SurveyProvider');
  return context;
};