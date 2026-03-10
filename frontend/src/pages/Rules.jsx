import { useEffect, useState } from "react";

import {
  getRulesAPI,
  searchRulesAPI,
  addRuleAPI,
  toggleRuleAPI,
  deleteRuleAPI
} from "../services/api";

export default function Rules() {

  const [rules,setRules] = useState([]);
  const [search,setSearch] = useState("");

  const [form,setForm] = useState({
    rule_name:"",
    regex_pattern:"",
    severity:"",
    category:""
  });

  const [loading,setLoading] = useState(false);


  useEffect(()=>{
    loadRules();
  },[]);


  /* ---------------- LOAD RULES ---------------- */

  const loadRules = async ()=>{

    try{

      setLoading(true);

      const res = await getRulesAPI();

      setRules(res.data);

    }catch(err){

      console.error("LOAD RULES ERROR",err);

    }finally{

      setLoading(false);

    }

  };


  /* ---------------- SEARCH RULES ---------------- */

  const searchRules = async ()=>{

    try{

      if(!search){

        loadRules();
        return;

      }

      const res = await searchRulesAPI(search);

      setRules(res.data);

    }catch(err){

      console.error("SEARCH ERROR",err);

    }

  };


  /* ---------------- ADD RULE ---------------- */

  const addRule = async ()=>{

    try{

      if(!form.rule_name || !form.regex_pattern){

        alert("Rule name and regex required");
        return;

      }

      await addRuleAPI({

        rule_name:form.rule_name,
        description:"",
        regex_pattern:form.regex_pattern,
        severity:form.severity || "MEDIUM",
        category:form.category || "General"

      });

      setForm({
        rule_name:"",
        regex_pattern:"",
        severity:"",
        category:""
      });

      loadRules();

    }catch(err){

      console.error("ADD RULE ERROR",err);

    }

  };


  /* ---------------- TOGGLE RULE ---------------- */

  const toggleRule = async(id)=>{

    try{

      await toggleRuleAPI(id);

      loadRules();

    }catch(err){

      console.error("TOGGLE ERROR",err);

    }

  };


  /* ---------------- DELETE RULE ---------------- */

  const deleteRule = async(id)=>{

    try{

      if(!window.confirm("Disable this rule?")) return;

      await deleteRuleAPI(id);

      loadRules();

    }catch(err){

      console.error("DELETE ERROR",err);

    }

  };


  return (

  <div className="p-6 max-w-6xl mx-auto">

    <h1 className="text-2xl font-bold mb-6">
      Rules Management
    </h1>


    {/* SEARCH BAR */}

    <div className="flex gap-3 mb-6">

      <input
      className="border p-2 rounded w-80"
      placeholder="Search rule..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      />

      <button
      onClick={searchRules}
      className="bg-blue-500 text-white px-4 py-2 rounded"
      >
      Search
      </button>

      <button
      onClick={loadRules}
      className="bg-gray-500 text-white px-4 py-2 rounded"
      >
      Reset
      </button>

    </div>


    {/* ADD RULE FORM */}

    <div className="bg-gray-100 p-4 rounded mb-8">

      <h2 className="font-semibold mb-4">
        Add New Rule
      </h2>

      <div className="grid grid-cols-4 gap-4">

        <input
        className="border p-2 rounded"
        placeholder="Rule Name"
        value={form.rule_name}
        onChange={(e)=>setForm({...form,rule_name:e.target.value})}
        />

        <input
        className="border p-2 rounded"
        placeholder="Regex Pattern"
        value={form.regex_pattern}
        onChange={(e)=>setForm({...form,regex_pattern:e.target.value})}
        />

        <input
        className="border p-2 rounded"
        placeholder="Severity (HIGH/MEDIUM/LOW)"
        value={form.severity}
        onChange={(e)=>setForm({...form,severity:e.target.value})}
        />

        <input
        className="border p-2 rounded"
        placeholder="Category"
        value={form.category}
        onChange={(e)=>setForm({...form,category:e.target.value})}
        />

      </div>

      <button
      onClick={addRule}
      className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
      Add Rule
      </button>

    </div>


    {/* RULES TABLE */}

    <div className="overflow-x-auto">

      <table className="w-full border rounded">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Rule</th>
            <th className="p-3 text-left">Severity</th>
            <th className="p-3 text-left">Enabled</th>
            <th className="p-3 text-left">Actions</th>

          </tr>

        </thead>


        <tbody>

          {loading && (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                Loading...
              </td>
            </tr>
          )}

          {!loading && rules.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                No rules found
              </td>
            </tr>
          )}

          {!loading && rules.map(rule => (

            <tr
            key={rule.id}
            className="border-t hover:bg-gray-50"
            >

              <td className="p-3">{rule.id}</td>

              <td className="p-3">{rule.rule_name}</td>

              <td className="p-3">{rule.severity}</td>

              <td className="p-3">
                {rule.enabled ? "Yes" : "No"}
              </td>

              <td className="p-3 flex gap-2">

                <button
                onClick={()=>toggleRule(rule.id)}
                className="bg-yellow-500 px-3 py-1 rounded text-white"
                >
                Toggle
                </button>

                <button
                onClick={()=>deleteRule(rule.id)}
                className="bg-red-500 px-3 py-1 rounded text-white"
                >
                Disable
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

  );

}