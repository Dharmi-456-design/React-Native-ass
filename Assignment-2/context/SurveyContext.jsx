import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SurveyContext = createContext(undefined);
const SURVEYS_KEY = '@smartfield_surveys';
const DRAFT_KEY = '@smartfield_draft';

// ─── Platform-aware storage ────────────────────────────────────────────────
// On web, window.localStorage persists across browser closes/refreshes.
// On native, AsyncStorage handles persistence.
const Storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.error('localStorage setItem failed', e);
      }
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error('localStorage removeItem failed', e);
      }
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};
// ──────────────────────────────────────────────────────────────────────────

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [draftSurvey, setDraftSurvey] = useState({});
  // Use a ref so delete always sees the latest surveys (fixes stale closure bug)
  const surveysRef = useRef([]);

  useEffect(() => {
    surveysRef.current = surveys;
  }, [surveys]);

  // Load persisted data on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedSurveys = await Storage.getItem(SURVEYS_KEY);
        if (storedSurveys) {
          const parsed = JSON.parse(storedSurveys);
          setSurveys(parsed);
          surveysRef.current = parsed;
        }
        const storedDraft = await Storage.getItem(DRAFT_KEY);
        if (storedDraft) setDraftSurvey(JSON.parse(storedDraft));
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    loadData();
  }, []);

  const addSurvey = async (survey) => {
    const newSurveys = [...surveysRef.current, survey];
    setSurveys(newSurveys);
    surveysRef.current = newSurveys;
    try {
      await Storage.setItem(SURVEYS_KEY, JSON.stringify(newSurveys));
    } catch (e) {
      console.error('Failed to save surveys', e);
    }
  };

  const deleteSurvey = async (id, fallbackItem) => {
    // Always read from ref so we never use a stale closure
    const current = surveysRef.current;
    let newSurveys;
    if (id) {
      newSurveys = current.filter((s) => String(s.id) !== String(id));
    } else if (fallbackItem) {
      // For entries without id, match by object reference or all field values
      newSurveys = current.filter((s) => s !== fallbackItem);
    } else {
      return; // nothing to delete
    }
    setSurveys(newSurveys);
    surveysRef.current = newSurveys;
    try {
      await Storage.setItem(SURVEYS_KEY, JSON.stringify(newSurveys));
    } catch (e) {
      console.error('Failed to save after delete', e);
    }
  };

  const updateDraft = (updates) => {
    setDraftSurvey((prev) => {
      const newDraft = { ...prev, ...updates };
      Storage.setItem(DRAFT_KEY, JSON.stringify(newDraft)).catch(console.error);
      return newDraft;
    });
  };

  const clearDraft = async () => {
    setDraftSurvey({});
    try {
      await Storage.removeItem(DRAFT_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SurveyContext.Provider value={{ surveys, addSurvey, deleteSurvey, draftSurvey, updateDraft, clearDraft }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) throw new Error('useSurvey must be used within SurveyProvider');
  return context;
};