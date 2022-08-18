import { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, ShoppingCart, Star } from "react-feather";
import { Badge } from "reactstrap";
import Drawer from "../../drawer/Drawer";
import getBookApi from "@services/books/getBookApi";

const ViewBookDetailsModal = (props) => {
  const { open, closeModal, bookId } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState();
  const [authorList, setAuthorList] = useState("");
  const [hasRemainingAuthors, setHasRemainingAuthors] = useState(false);

  const setBookData = async () => {
    const bookResData = await getBookApi(bookId);
    setBookDetails(bookResData.data);

    let conCatAuthor = "";
    for (let index = 0; index < bookResData.data.authors.length; index++) {
      const author = bookResData.data.authors[index];
      if (!index) conCatAuthor += `${author.name}`;
      else conCatAuthor += `, ${author.name}`;

      if (index === 1) break;
    }
    setAuthorList(conCatAuthor);
    setHasRemainingAuthors(bookResData.data.authors.length > 2);

    setIsLoading(false);
  };

  useEffect(() => {
    if (open) return;
    setBookDetails();
  }, [open]);

  useEffect(() => {
    if (!bookId || !bookId) return;
    setIsLoading(true);
    setBookData();
  }, [open, bookId]);

  return (
    <Drawer
      isOpen={open}
      toggle={closeModal}
      direction={"end"}
      style={{ width: "100%", maxWidth: "650px" }}
    >
      {isLoading ? (
        <div className="p-2">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="p-2">
          <div className="pb-1">
            <div className="d-flex justify-content-between mt-1">
              <div className="">
                <ArrowLeft className="cursor-pointer" />
              </div>
              <div className="">
                <ShoppingCart className="cursor-pointer" />
              </div>
            </div>
          </div>

          <div
            className="hide-scroll-bar overflow-auto"
            style={{ height: "calc(100vh - 95px)" }}
          >
            <div className="bg-light-secondary rounded p-1 mt-2 position-relative">
              <div
                className="position-absolute"
                style={{
                  right: "12px",
                }}
              >
                <div
                  className="bg-light-primary rounded-circle"
                  style={{ padding: "3px 6px" }}
                >
                  <Bookmark size={15} className="text-primary" />
                </div>
              </div>
              <div className="d-flex">
                <div
                  className="bg-warning rounded overflow-hidden"
                  style={{
                    width: "120px",
                    height: "183px",
                  }}
                >
                  <img
                    src={bookDetails?.coverImage}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="flex-grow-1 px-1">
                  <p className="p-0 mb-0 text-primary fw-bolder">
                    {bookDetails?.name}
                  </p>
                  <p
                    className="p-0 mb-0 text-secondary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {authorList} {hasRemainingAuthors ? ", ..." : null}
                  </p>
                  <div className="mt-1 d-flex align-items-center">
                    <Star className="text-warning" size={16} />
                    <p
                      className="p-0 mb-0 text-secondary"
                      style={{ fontSize: "0.75rem", marginLeft: "3px" }}
                    >
                      (233 Ratings)
                    </p>
                  </div>
                  <p
                    className="p-0 mb-0 text-secondary"
                    style={{ fontSize: "0.7rem" }}
                  >
                    ISBN NO: 23232
                  </p>
                  <div className="d-flex">
                    <p
                      className="p-0 mb-0 fw-bold"
                      style={{ fontSize: "0.95rem" }}
                    >
                      Market Price:
                    </p>
                    <div style={{ paddingLeft: "5px" }}>
                      <p
                        className="p-0 mb-0 fw-bold"
                        style={{ fontSize: "0.95rem" }}
                      >
                        <span className="text-primary">Rs. 600</span>{" "}
                        <span
                          className="text-secondary"
                          style={{ fontSize: "0.7rem" }}
                        >
                          (Hard Cover)
                        </span>
                      </p>
                      <p
                        className="p-0 mb-0 fw-bold"
                        style={{ fontSize: "0.95rem" }}
                      >
                        <span className="text-primary">Rs. 600</span>{" "}
                        <span
                          className="text-secondary"
                          style={{ fontSize: "0.7rem" }}
                        >
                          (Proper Back)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge color="light-primary" style={{ fontSize: "10px" }}>
                      Action
                    </Badge>
                    <Badge
                      color="light-primary ms-1"
                      style={{ fontSize: "10px" }}
                    >
                      Mystery
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-dark fw-bolder">Seller List</p>

              {Array.from(Array(0).keys()).map((d) => {
                return (
                  <div className="d-flex rounded bg-light p-1 mt-1" key={d}>
                    <div>
                      <div
                        className="rounded-circle bg-light-primary"
                        style={{ height: "40px", width: "40px" }}
                      ></div>
                    </div>
                    <div className="flex-grow-1 px-1">
                      <p className="p-0 mb-0 fw-bold text-primary">
                        Yumick Gharti
                      </p>
                      <p
                        className="p-0 mb-0 text-secondary"
                        style={{
                          fontSize: "0.77rem",
                        }}
                      >
                        Used book available
                      </p>
                    </div>
                    <div>
                      <p
                        className="p-0 mb-0 text-secondary"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Rs. 600
                      </p>
                      <Badge color="light-primary" style={{ fontSize: "10px" }}>
                        used
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default ViewBookDetailsModal;
