import "@styles/react/libs/flatpickr/flatpickr.scss";
import { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalHeader,
  Row,
  Alert,
  ModalBody,
} from "reactstrap";
import ImageDropzone from "../../imageDropzone/ImageDropzone";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import toast from "react-hot-toast";
import ButtonWithSpinner from "../../ui/ButtonWithSpinner";
import getAllCategoryForDropdownApi from "@services/category/getAllCategoryForDropdownApi";
import createBookApi from "@services/books/createBookApi";
import getAllAuthorForDropdownApi from "@services/author/getAllAuthorForDropdownApi";
import getPublisherForDropdownApi from "@services/publisher/getPublisherForDropdownApi";
import getLanguageForDropdownApi from "@services/language/getLanguageForDropdownApi";

function verifyBookData(props) {
  const {
    name,
    hardCoverPrice,
    paperBackPrice,
    authors,
    isbn,
    publisher,
    publishedYear,
    language,
    category,
    description,
  } = props;

  if (!name.trim().length) {
    return { isVerified: false, message: "Book name is required." };
  }
  if (!hardCoverPrice && !paperBackPrice) {
    return {
      isVerified: false,
      message: "Either hard cover price or paper book price is required.",
    };
  }
  if (!authors.length) {
    return { isVerified: false, message: "Author is required." };
  }
  if (!isbn.trim().length) {
    return { isVerified: false, message: "ISBN number is required." };
  }
  if (!publisher) {
    return { isVerified: false, message: "Publisher is required." };
  }
  if (!publishedYear) {
    return { isVerified: false, message: "Publisher year is required." };
  }
  if (!language) {
    return { isVerified: false, message: "Language is required." };
  }
  if (!category.length) {
    return { isVerified: false, message: "Category is required." };
  }
  if (!description.trim().length) {
    return { isVerified: false, message: "Description is required." };
  }

  return { isVerified: true, message: "Verified book data." };
}

const bookTypeOptions = [
  {
    label: "Normal Book",
    value: "NORMAL_BOOK",
  },
  {
    label: "Feature Book",
    value: "FEATURED_BOOK",
  },
];

const CreateBookModal = (props) => {
  const { open, closeModal, setMutation } = props;
  const [categoryListOpt, setCategoryListOtp] = useState([]);
  const [authorListOpt, setAuthorListOpt] = useState([]);
  const [languageListOpt, setLanguageListOtp] = useState([]);
  const [publisherListOpt, setPublisherListOtp] = useState([]);

  const [avatar, setAvatar] = useState([]);
  const [name, setName] = useState("");
  const [hardCoverPrice, setHardCoverPrice] = useState(0);
  const [paperBackPrice, setPaperBackPrice] = useState(0);
  const [isbn, setIsbn] = useState("");
  const [edition, setEdition] = useState("");
  const [publishedYear, setPublishedYear] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [language, setLanguage] = useState(null);
  const [category, setCategory] = useState([]);
  const [description, setDescription] = useState("");
  const [type, setType] = useState(bookTypeOptions[0]);
  const [authors, setAuthors] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setDropdownsData = async () => {
    try {
      const authorResData = await getAllAuthorForDropdownApi();
      const categoryResData = await getAllCategoryForDropdownApi();
      const languageResData = await getLanguageForDropdownApi();
      const publisherResData = await getPublisherForDropdownApi();

      const authorOptionsData = Array.from(authorResData.data, (author) => {
        return { label: author.name, value: author._id };
      });

      const categoryOptionsData = Array.from(
        categoryResData.data || [],
        (data) => {
          return { label: data.name, value: data._id };
        }
      );

      const languageOptionsData = Array.from(
        languageResData.data,
        (language) => {
          return { label: language.name, value: language._id };
        }
      );

      const publisherOptionsRes = Array.from(
        publisherResData.data,
        (publisher) => {
          return { label: publisher.name, value: publisher._id };
        }
      );

      setAuthorListOpt(authorOptionsData);
      setCategoryListOtp(categoryOptionsData);
      setLanguageListOtp(languageOptionsData);
      setPublisherListOtp(publisherOptionsRes);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong, please try again later."
      );
    }
  };

  useEffect(() => {
    setDropdownsData();
  }, []);

  useEffect(() => {
    if (open) return;
    setAvatar([]);
    setName("");
    setHardCoverPrice(0);
    setPaperBackPrice(0);
    setIsbn("");
    setEdition("");
    setPublishedYear(null);
    setPublisher(null);
    setLanguage(null);
    setCategory([]);
    setType(bookTypeOptions[0]);
    setAuthors([]);
    setDescription("");
    setErrorMsg("");
    setIsSubmitted(false);
  }, [open]);

  useEffect(() => {
    setErrorMsg("");
  }, [
    name,
    hardCoverPrice,
    paperBackPrice,
    authors,
    isbn,
    edition,
    publisher,
    publishedYear,
    language,
    category,
    description,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorMsg.trim().length || isSubmitted) return;

    const { isVerified, message } = verifyBookData({
      name,
      hardCoverPrice,
      paperBackPrice,
      authors,
      isbn,
      publishedYear,
      language,
      category,
      description,
      publisher,
    });
    if (!isVerified) {
      setErrorMsg(message || "");
      return;
    }

    setIsSubmitted(true);

    const formData = new FormData();
    if (avatar && avatar.length) formData.append("coverImage", avatar[0]);
    formData.append("name", name);
    if (hardCoverPrice) {
      formData.append("hardCoverPrice", parseFloat(hardCoverPrice));
    }
    if (paperBackPrice) {
      formData.append("softCoverPrice", parseFloat(paperBackPrice));
    }
    authors.forEach((author) => {
      formData.append("authors", author.value);
    });
    formData.append("isbn", isbn);
    if (edition) formData.append("edition", edition);
    if (publisher) formData.append("publisherId", publisher.value);
    if (publishedYear) formData.append("publishedYear", publishedYear);
    if (language) formData.append("languageId", language.value);
    if (type.value === "FEATURED_BOOK") {
      formData.append("isFeatured", true);
    }
    category.forEach((categoryItem) => {
      formData.append("categories", categoryItem.value);
    });
    formData.append("description", description);

    try {
      const bookResData = await createBookApi(formData);
      toast.success(bookResData?.message || "Successfully created");
      setMutation(true);
      closeModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong, Please try again later."
      );
    }

    setIsSubmitted(false);
  };

  return (
    <Modal
      isOpen={open}
      toggle={closeModal}
      className={`modal-dialog-centered px-2`}
      style={{
        width: "100%",
        maxWidth: "1150px",
      }}
    >
      <ModalHeader className="bg-transparent" toggle={closeModal} />
      <h2 className="text-center p-0 mb-0">Create Book</h2>
      <ModalBody className="p-2 p-lg-3 m-0">
        {errorMsg?.trim().length ? (
          <Alert className="p-1" color="danger">
            {errorMsg}
          </Alert>
        ) : null}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <ImageDropzone files={avatar} setFiles={setAvatar} />
            </Col>
          </Row>
          <Row>
            <Col className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Book Name
              </Label>
              <Input
                type="text"
                placeholder="Enter book name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={3} xxl={2} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Hard Cover Price
              </Label>
              <Input
                placeholder="Hard Cover"
                type="number"
                value={hardCoverPrice}
                onChange={(e) => setHardCoverPrice(e.target.value)}
              />
            </Col>
            <Col xs={12} lg={3} xxl={2} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Paper Back Price
              </Label>
              <Input
                placeholder="Paper Back"
                value={paperBackPrice}
                onChange={(e) => setPaperBackPrice(e.target.value)}
              />
            </Col>
            <Col xs={12} lg={3} xxl={4} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Author Name
              </Label>
              <Select
                isMulti
                options={authorListOpt}
                value={authors}
                onChange={(data) => setAuthors(data)}
              />
            </Col>
            <Col xs={12} lg={3} xxl={4} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                ISBN Number
              </Label>
              <Input
                type="text"
                placeholder="ISBN Number"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} lg={3} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Edition
              </Label>
              <Input
                placeholder="Edition"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              />
            </Col>
            <Col xs={12} lg={3} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Publisher
              </Label>
              <Select
                placeholder="Select publisher"
                options={publisherListOpt}
                value={publisher}
                onChange={(data) => setPublisher(data)}
              />
            </Col>
            <Col xs={12} lg={3} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Published Year
              </Label>
              <Flatpickr
                className="form-control"
                value={publishedYear}
                onChange={(date) => setPublishedYear(date)}
              />
            </Col>
            <Col xs={12} lg={3} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Language
              </Label>
              <Select
                placeholder="Select language"
                options={languageListOpt}
                value={language}
                onChange={(data) => setLanguage(data)}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Type
              </Label>
              <Select
                options={bookTypeOptions}
                value={type}
                onChange={(data) => setType(data)}
              />
            </Col>
            <Col xs={12} md={6} className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Category
              </Label>
              <Select
                isMulti
                options={categoryListOpt}
                value={category}
                onChange={(data) => setCategory(data)}
              />
            </Col>
          </Row>
          <Row>
            <Col className="mt-2">
              <Label
                for="book-name"
                className="text-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                Description
              </Label>
              <Input
                type="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-end mt-3">
              <Button color="danger" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <ButtonWithSpinner
                color="primary"
                className="ms-2"
                type="submit"
                isLoading={isSubmitted}
              >
                {isSubmitted ? "Saving..." : "Save"}
              </ButtonWithSpinner>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CreateBookModal;
