import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

export const scanTextAPI = (text) =>
  api.post("/scan-text", { text });

export const scanFileAPI = (formData) =>
  api.post("/scan-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchScanHistoryAPI = () =>
  api.get("/api/scans");

/* ---------- RULE MANAGEMENT ---------- */

export const getRulesAPI = () => {
  return api.get("/api/rules");
};

export const searchRulesAPI = (query) => {
  return api.get(`/api/rules/search?query=${query}`);
};


export const addRuleAPI = (data) => {
  return api.post("/api/rules", data);
};


export const toggleRuleAPI = (id) => {
  return api.patch(`/api/rules/${id}/toggle`);
};


export const deleteRuleAPI = (id) => {
  return api.delete(`/api/rules/${id}`);
};