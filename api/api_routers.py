from fastapi import APIRouter
from chains.search_chain import search


# router
router = APIRouter(
    prefix="/v1",
    tags=["backend"]
)


# For calling search functionality
@router.get("/search/{document_id}")
def search_and_return(document_id: str | None, query: str = "asdf"):
    if document_id is not None:
        document_path = f"./resources/{document_id}/"
    else:
        document_path = f"./resources/"

    response = search(question=query, document_path=document_path)
    response["api_debug_msg"] = "You are in the search page."
    return response


@router.get("/summary")
def summarize():
    return {"api_debug_msg": "You are in the summary page."}
