import logging
from chains.search_chain import search


log = logging.getLogger(__name__)


def main(question, document_path):
    response = search(question, document_path)
    print(response["output"])
    return 0


if __name__ == "__main__":
    q = (
        "Consider A and B are two sets, such that |A| = 50 , and |A – B| = 20 ,"
        "\nand |B| = 85 . Find the value of |B – A| ."
    )
    dp = ""
    main(q, dp)
