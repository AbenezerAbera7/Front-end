import React, { useState, useEffect } from "react";
import "./JSONFileUploader.css";  // Assuming you create a separate CSS file for styles
import { useTheme } from "../ThemeContext";
import { Alert } from "react-bootstrap";

const JSONFileUploader = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [exportFormat, setExportFormat] = useState("docx");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [organizations, setOrganizations] = useState([]); 
  const [selectedOrganization, setSelectedOrganization] = useState(""); 
  const token = localStorage.getItem('token');
  const { isDarkMode, toggleDarkMode } = useTheme()
  const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/organizations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          setError('Failed to fetch organizations');
          return 
        }
        const data = await response.json();
        setOrganizations(data.organizations);
        if (data.organizations.length > 0) {
          setSelectedOrganization(data.organizations[0].id);
        }
         
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(()=>{
   setTimeout(()=>{
    setError()
    setMessage()
   },[4000])
  },[message,error])

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setError("");

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;

        // Check if the file is encrypted
        if (fileContent.startsWith("\"")) {
          setIsEncrypted(true);
        } else {
          setIsEncrypted(false);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      setError("Please upload a valid JSON file.");
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError("No file uploaded.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("decryptionKey", decryptionKey);
    formData.append("exportFormat", exportFormat);
    formData.append("organization_id", selectedOrganization); 
    

    setLoading(true);
    setError("");
    const token = localStorage.getItem('token');

    try {
      const response = await fetch("http://localhost:5001/api/uploadfile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.error || "Error while uploading";
        setError(errorMessage);
      } else {
        const data = await response.json();
        const successMessage = data.message || "Successfully Uploaded";
        setMessage(successMessage);
      }

    } catch (err) {
      setError("Error uploading the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`json-uploader-container shadow ${themeClass}`}>
       {error && <Alert variant='danger' >{error}</Alert>}
       {message && <Alert  variant="success" >{message}</Alert>}
      <h2>Upload a JSON File</h2>
      <input
        className="input-file"
        type="file"
        accept=".json"
        onChange={handleFileUpload}
      />

      {isEncrypted && (
        <div className={`encrypted-section ${themeClass}`}>
          <h3  className={`${themeClass}`}>This file is encrypted. Please provide the decryption key:</h3>
          <input
            type="password"
            placeholder="Enter decryption key"
            value={decryptionKey}
            onChange={(e) => {
              setError('');
              setDecryptionKey(e.target.value);
            }}
            className={`${themeClass}`}
          />
        </div>
      )}

      
<div className={`organization-section ${themeClass}`}>
      <h3  className={`${themeClass}`}>Select Organization:</h3>
      <select
        value={selectedOrganization}
        onChange={(e) => setSelectedOrganization(e.target.value)}
        required
        className={`${themeClass}`}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
    

      {file && !isEncrypted && (
        <div className={`Upload-section ${themeClass}`}>
          <button
            className="btn-primary"
            onClick={handleParse}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {isEncrypted && decryptionKey && (
        <div  className={`Upload-section ${themeClass}`}>
          <button
            className="btn-primary"
            onClick={handleParse}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

    </div>
  );
};

export default JSONFileUploader;
