import React, { useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:3000/upload', formData, {
        
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus(response.data.message);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setUploadStatus('Failed to upload file.');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 5, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          העלאת קבצים
        </Typography>
        <input type="file" onChange={handleFileChange} />
        <Button variant="contained" onClick={handleFileUpload}>
          העלאה
        </Button>
        {fileName && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            קובץ שנבחר: {fileName}
          </Typography>
        )}
        {uploadStatus && (
          <Typography variant="body1" color={uploadStatus.includes('Success') ? 'success' : 'error'} sx={{ mt: 2 }}>
            {uploadStatus}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default FileUpload;