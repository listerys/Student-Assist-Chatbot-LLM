# Backend API
## Backend Architecture
```
API/Server: FASTAPI + Uvicorn
Programming Language: Python
```

## Setup for local deployment
1. Install anaconda or miniconda. 
2. Navigate to the `api` folder.
3. Add **OpenAI API key** to the `.env.sample` file, and save it as `.env` file. 
4. Create a conda virtual environment using below command.
```commandline
$ conda env create -f environment.yml
```
5. Run the Uvicorn/FASTAPI webserver. Host IP and port can be 
specified using below command.
```commandline
$ uvicorn main:app --host 0.0.0.0 --port 80 --reload
```
6. For testing/listing all the backend APIs use the following link:
```
http://0.0.0.0/docs
```

Or you can also use the curl command to test the API backend server.
```commandline
$ curl -X 'GET' \
  'http://0.0.0.0/v1/search/course1?query=Consider%20A%20and%20B%20are%20two%20sets%2C%20such%20that%20%7CA%7C%20%3D%2050%20%2C%20and%20%7CA%20%E2%80%93%20B%7C%20%3D%2020%20%2C%5Cnand%20%7CB%7C%20%3D%2085%20.%20Find%20the%20value%20of%20%7CB%20%E2%80%93%20A%7C%20.' \
  -H 'accept: application/json'
```

## Backend Project Structure
Course materials (pdfs, videos, ppt, text files etc.) that are 
uploaded to this portal will be placed under the `resources` folder. Each 
course will have its own sub-directory under the `resources` folder. 


Programming logic for sematic search, summarization, and audio to text 
conversation are in the `chains` folder. 

Semantic Search logic is in the following files:
```
api/chains/search_chain.py
api/chains/retrievers.py
api/chains/memory.py
```

Summarization logic is in the following files:
```

```

Audio to text is in the following files:
```

```

## Authors
- **Sri Sasmi Polu - GWU**
