import React, { useState, useEffect, useRef } from "react";
import { MdDeleteSweep } from "react-icons/md";
import { BiExport, BiAnalyse } from "react-icons/bi";
import {FaExclamationTriangle,FaEye} from 'react-icons/fa'
import {AiOutlineWarning} from 'react-icons/ai'
import { Doughnut } from "react-chartjs-2";
import { Button, Table, Spinner, Modal, Alert, Col, Container, Card,Row, Image } from 'react-bootstrap';
import { useTheme } from "../ThemeContext";

import { ArcElement, Tooltip, Legend, Chart as ChartJS } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function PastScans({ organizationid }) {
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportloading, setExportloading] = useState(false);
  const [error, setError] = useState(null);
  const [exporterror, setExportError] = useState(null);
  const [message,setMessage]=useState(null)
  const [scanning, setScanning] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectExportUrl, setSelectExportUrl] = useState(null);
  const [exportFormat, setExportFormat] = useState(""); // New state to track export preference
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [scanIdToDelete, setScanIdToDelete] = useState(null); // Store scanId to delete
  const [reloadScanResult,setReloadScanResult]=useState(false)
  const [actionTotake,setActionTotake]=useState(null)
  const [showActionModal, setShowActionModal] = useState(false);
  const [fileUrl,setFileUrl]=useState(null)
  const [exportTemplate,setExportTemplate]=useState(null)
  const chartRef = useRef(null); // Create a ref for the doughnut chart
  const { isDarkMode, toggleDarkMode } = useTheme()
  const themeClass = isDarkMode ? 'dark' : 'light'

  const templates=[{"Name":"Template 1","id":1,'url':'/images/pexels-anntarazevich-6560286.jpg'},{"Name":"Template 2","id":2,'url':'./images/User.png'},{"Name":"Template 3","id":3,'url':'./images/User.png'}]

  const fetchScanResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/scan_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationid })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch scan results');
      }

      const data = await response.json();
      setScanResults(data.result);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanResults();
  }, [organizationid,reloadScanResult]);

  const handleDelete = (scanId) => {
    setScanIdToDelete(scanId); 
    setShowDeleteModal(true); 
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/scan_results/${scanIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete scan');
      }


      // Remove the deleted scan from the list
      setScanResults(scanResults.filter(result => result.scan_id !== scanIdToDelete));
      setShowDeleteModal(false); // Close the modal after deletion
    } catch (error) {
      setError(error.message);
      setShowDeleteModal(false); // Close the modal if error occurs
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false); // Close the modal if cancelled
    setShowActionModal(false)
    setShowExportModal(false)
    setExportFormat()
    setFileUrl()
    setExportTemplate()
    
  };

  const getScoreCategory = (score) => {
    const numericScore = parseInt(score, 10);
    if (numericScore >= 50) return "red";
    if (numericScore >= 20) return "yellow";
    return "green";
  };

  const getChartData = (score) => {
    const category = getScoreCategory(score);
    return {
      labels: ["Score"],
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [category, "lightgray"],
          hoverBackgroundColor: [category, "lightgray"]
        }
      ]
    };
  };

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Destroy the chart to avoid the canvas issue
      }
    };
  }, []);

  const handleAnalyse =async (filepath) => {
    try {
      const token = localStorage.getItem('token');
      const jsontosend={fileUrl:filepath}
      const response = await fetch(`http://localhost:5002/api/score/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(jsontosend)

      });

      if (!response.ok) {
        throw new Error('Failed to Score');
      }
      setReloadScanResult(pre=>!pre)

    
    } catch (error) {
      setError(error.message);
   
    }finally{
      setScanning({})
    }
  
 
  };

  const handleExport = (filepath) => {
    setSelectExportUrl(filepath)
    setShowExportModal(true); // Show the export modal when Export button is clicked
  };
  const handleAction= (action)=>{
    const parsed_action=JSON.parse(action)
    setActionTotake(parsed_action)
    setShowActionModal(true)

  }
  const handleView=async(fileUrl)=>{
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl:fileUrl }), // Send the selected format
      });
      
      if (!response.ok) {
        throw new Error('Failed to View the file');
      }
      const data=await response.json()
      const jsonString=JSON.stringify(data['view'])
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');

      newTab.onload = () => {
        URL.revokeObjectURL(url);
      };

    } catch (error) {
      setExportError(error.message);
    }finally{
      setScanning({})
    }
  }

  const sendExportRequest = async (template_id) => {
    setExportloading(true);  // Show the spinner
    setFileUrl(null);  // Reset the fileUrl in case there was a previous file
    setExportError(null)
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl: selectExportUrl, format: exportFormat,template_id: template_id }), // Send the selected format
      });

      if (!response.ok) {
        throw new Error('Failed to export the file');
      }

      const data = await response.blob();
      const fileExtension = exportFormat === 'pdf' ? 'pdf' : 'docx';
      const filename = `scan_result.${fileExtension}`;

      // Create a temporary link to view or download the file
      const objectURL = URL.createObjectURL(data);
      setFileUrl(objectURL);  // Store the file URL to allow download or view

      setExportloading(false);  // Hide the spinner when done
    } catch (error) {
      setExportError(error.message);
      setExportloading(false);  // Hide the spinner if there was an error
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const fileExtension = exportFormat === 'pdf' ? 'pdf' : 'docx';
      const filename = `scan_result.${fileExtension}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.click();
    }
  };

  const handleExportView = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  useEffect(()=>{

    setTimeout(() => {
      setError(null)
      setMessage(null)
      setExportError()
    }, 4000);
    
  },[error,message,exporterror])

  if (loading) {
    return <div className="d-flex justify-content-center"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div className="mt-4">
      
       {error && (<Alert variant={'danger'}>{error}</Alert>)}
      <Table variant={isDarkMode?"dark":'light'} responsive hover className="table-striped">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>No</th>
            <th style={{ textAlign: 'center' }}>Upload</th>
            <th style={{ textAlign: 'center' }}>Score</th>
            <th style={{ textAlign: 'center' }}>Created Date</th>
            <th style={{ textAlign: 'center' }}>View</th>
            <th style={{ textAlign: 'center' }}>Score</th>
            <th style={{ textAlign: 'center' }}>Rationale</th>
            <th style={{ textAlign: 'center' }}>Export</th>
            <th style={{ textAlign: 'center' }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {scanResults.map((result, index) => (
            <tr key={result.scan_id}>
              <td>{index + 1}</td>
              <td>{result.file_path.split('/').pop()}</td>
              <td style={{ maxWidth: '150px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {scanning[index] ? <div className="d-flex justify-content-center"><Spinner animation="border" variant="primary" /></div> : <Doughnut
                    style={{ maxWidth: '100px' }}
                    ref={chartRef}
                    data={getChartData(result.score)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } }
                    }} />} 
                </div>
              </td>
              <td>{new Date(result.created_at).toLocaleString()}</td>
              <td>
                <Button variant="outline-primary" onClick={() => {
                  setScanning({ [index]: true });
                  handleView(result.file_path);
                }}>
                  <FaEye className={scanning[index] ? 'spin_me' : ''} />
                </Button>
              </td>
              <td>
                <Button variant="outline-info" onClick={() => {
                  setScanning({ [index]: true });
                  handleAnalyse(result.file_path);
                }}>
                  <BiAnalyse className={scanning[index] ? 'spin_me' : ''} />
                </Button>
              </td>
              <td>
                <Button variant="outline-warning" onClick={() => handleAction(result.action)}>
                  <AiOutlineWarning />
                </Button>
              </td>
              <td>
                <Button variant="outline-success" onClick={() => handleExport(result.file_path)}>
                  <BiExport />
                </Button>
              </td>
              <td>
                <Button variant="outline-danger" onClick={() => handleDelete(result.scan_id)}>
                  <MdDeleteSweep />
                </Button>
              </td>

            
            </tr>
          ))}
        </tbody>
      </Table>

       <Modal show={showExportModal} onHide={() => {
        setShowExportModal(false)
        setFileUrl(null)
        setExportloading(false)
        setExportError(null)
      }
       }>
        <Modal.Header closeButton>
        <Modal.Title>Export Scan Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Export format buttons */}
        {!exportloading && !exportFormat && (
          <>
            <Button
              variant="primary"
              onClick={() => {
                setExportFormat('pdf');
              }}
              className="w-100 mb-2"
            >
              Export as PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setExportFormat('docx')              
              }}
              className="w-100"
            >
              Export as DOCX
            </Button>
          </>
        )}

        {/* exportloading spinner while waiting for API */}
        {exportloading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" />
          </div>
        )}
        
        {!exportloading && !exportTemplate && exportFormat &&(
            <Container>      
              <Row>
              {templates.map((item, index) => {
                return (
                  <Col key={index} lg={4} md={6} sm={12}>
                    <Card>
                      <h4>{item.Name || "Unknown"}</h4>
                      <Button onClick={() => sendExportRequest(item.id)}>
                        <img src={item.url} style={{width:'100%',height:'100%'}} alt={item.Name} />
                      </Button>
                    </Card>
                  </Col>
                );
              })}

              </Row>
            </Container>
          )
        }



        {/* Show buttons to download or view once the file is ready */}
        {fileUrl && !exportloading && (
          <div>
            <Button variant="success" onClick={handleDownload} className="w-100 mb-2">
              Download File
            </Button>
            <Button variant="info" onClick={handleExportView} className="w-100">
              View File
            </Button>
          </div>
        )}

        {/* Display error message */}
        {exporterror && (<Alert variant={'danger'}>{exporterror}</Alert>)}
      </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this scan result?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showActionModal} onHide={cancelDelete} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Action To Take</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Table responsive hover className="table-striped">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>No</th>
            <th style={{ textAlign: 'center' }}>Catagory</th>
            <th style={{ textAlign: 'center' }}>Cause</th>
            <th style={{ textAlign: 'center' }}>Risk</th>
            <th style={{ textAlign: 'center' }}>Recommandation</th>

          </tr>
        </thead>
        <tbody>
          {actionTotake && Object.keys(actionTotake).map((key,index) => (
            <tr key={index}>
              <td>{index+1}</td>
              <td>{key}</td>
              <td>{actionTotake[key][1]}</td>
              <td>{actionTotake[key][0]}%</td>
              <td>{actionTotake[key][2]}</td>
              
            </tr>
          ))}
        </tbody>
      </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PastScans;
