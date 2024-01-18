import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:5001/diagnose', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            //setResponse(res.data);
            
            console.log(res);
        } catch (err) {
            console.error("Error:", err);
            if (err.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server responded with:", err.response.status, err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No response received:", err.request);
            } else {
                // Something else happened in setting up the request
                console.error("Error setting up request:", err.message);
            }
            setResponse('An error occurred while uploading the file.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {response && <div>{JSON.stringify(response)}</div>}
        </div>
    );
};

export default ImageUpload;
