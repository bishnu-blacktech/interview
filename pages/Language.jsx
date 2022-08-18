import { useState, useReducer, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "reactstrap";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import CreateLanguageModal from "@customComponents/modals/language/CreateLanguageModal";
import LanguageTable from "@customComponents/language/languageTable/LanguageTable";
import UpdateLanguageModal from "@customComponents/modals/language/UpdateLanguageModal";
import { DeleteSweetAlert } from "@customComponents/sweetAlert/SweetAlert";
import getAllLanguageApi from "@services/language/getAllLanguageApi";
import searchLanguageApi from "@services/language/searchLanguageApi";
import deleteLanguageApi from "@services/language/deleteLanguageApi";

const languageInitialState = {
  data: [],
  totalPage: 1,
  page: 1,
  refetch: false,
  limit: 25,
  isLoading: true,
};

const searchedLanguageInitialState = {
  data: [],
  totalPage: 1,
  page: 1,
  limit: 25,
  refetch: false,
  query: "",
  isLoading: true,
};

const initialMutationState = {
  createMutation: false,
  updateMutation: false,
  deleteMutation: false,
};

function reducerLanguage(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "reset":
      return bookInitialState;
  }
}

function reducerSearchedLanguage(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "reset":
      return searchedBookInitialState;
  }
}

function reducerMutation(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "reset":
      return initialMutationState;
  }
}

const Language = () => {
  const [searchKey, setSearchKey] = useState("");
  const [searchValue] = useDebounce(searchKey, 500);

  const [language, dispatchLanguage] = useReducer(
    reducerLanguage,
    languageInitialState
  );
  const [searchedLanguage, dispatchSearchedLanguage] = useReducer(
    reducerSearchedLanguage,
    searchedLanguageInitialState
  );
  const [mutation, dispatchMutation] = useReducer(
    reducerMutation,
    initialMutationState
  );

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isUpdateLanguageModalOpened, setIsUpdateLanguageModalOpened] =
    useState(false);
  const [isCreateLanguageModalOpened, setIsCreateLanguageModalOpened] =
    useState(false);

  // Function to load language data
  const setLanguageData = async () => {
    try {
      const languageResData = await getAllLanguageApi({
        page: language.page,
        count: language.limit,
      });

      if (language.page !== 1 && !languageResData.data.docs.length) {
        dispatchLanguage({
          type: "update",
          payload: {
            isLoading: false,
            page: 1,
            refetch: true,
          },
        });
        return;
      }

      dispatchLanguage({
        type: "update",
        payload: {
          data: languageResData.data.docs,
          totalPage: languageResData.data.totalPages,
          isLoading: false,
          refetch: false,
        },
      });
    } catch {
      dispatchLanguage({
        type: "update",
        payload: {
          data: [],
          isLoading: false,
          refetch: false,
        },
      });
      toast.error("Facing a problem while loading the language data.");
    }
    dispatchMutation({ type: "reset" });
  };

  // Function to load and set searched language data
  const setSearchedLanguageData = async () => {
    try {
      const languageResData = await searchLanguageApi({
        page: searchedLanguage.page,
        count: searchedLanguage.limit,
        query: searchedLanguage.query,
      });

      if (searchedLanguage.page !== 1 && !languageResData.data.docs.length) {
        dispatchSearchedLanguage({
          type: "update",
          payload: {
            page: 1,
            isLoading: false,
            refetch: true,
          },
        });
        return;
      }

      dispatchSearchedLanguage({
        type: "update",
        payload: {
          data: languageResData.data.docs,
          totalPage: languageResData.data.totalPages,
          isLoading: false,
          refetch: false,
        },
      });
    } catch {
      dispatchSearchedLanguage({
        type: "update",
        payload: {
          data: [],
          isLoading: false,
          refetch: false,
        },
      });
      toast.error("Facing a problem while loading the searched language data.");
      dispatchMutation({ type: "reset" });
    }
  };

  useEffect(() => {
    dispatchLanguage({
      type: "update",
      payload: {
        page: 1,
        isLoading: true,
        refetch: true,
      },
    });
  }, []);

  useEffect(() => {
    if (language.refetch) setLanguageData();
  }, [language]);

  useEffect(() => {
    if (searchedLanguage.refetch) setSearchedLanguageData();
  }, [searchedLanguage]);

  useEffect(() => {
    if (mutation.createMutation) {
      dispatchLanguage({
        type: "update",
        payload: {
          page: 1,
          isLoading: false,
          refetch: true,
        },
      });

      dispatchSearchedLanguage({
        type: "update",
        payload: {
          page: 1,
          isLoading: false,
          refetch: searchedLanguage.query.trim().length > 2,
        },
      });
    } else if (mutation.updateMutation) {
      dispatchLanguage({
        type: "update",
        payload: {
          refetch: true,
        },
      });

      dispatchSearchedLanguage({
        type: "update",
        payload: {
          refetch: searchedLanguage.query.trim().length > 2,
        },
      });
    } else if (mutation.deleteMutation) {
      dispatchLanguage({
        type: "update",
        payload: {
          refetch: true,
        },
      });

      dispatchSearchedLanguage({
        type: "update",
        payload: {
          refetch: searchedLanguage.query.trim().length > 2,
        },
      });
    }
  }, [mutation]);

  useEffect(() => {
    const searchValueLen = searchValue.trim().length;

    dispatchSearchedLanguage({
      type: "update",
      payload: {
        refetch: searchValueLen >= 2,
        query: searchValue.trim(),
        isLoading: true,
      },
    });
  }, [searchValue]);

  const openUpdateLanguageModal = (id) => {
    setSelectedLanguage(id);
    setIsUpdateLanguageModalOpened(true);
  };

  const deleteLanguage = async (props) => {
    const { id, name } = props;
    const { isConfirmed } = await DeleteSweetAlert({
      text: `Do you want to delete this (${name}) language?`,
      confirmButtonText: "Yes, delete it",
    });

    if (!isConfirmed) return;

    try {
      const languageResData = await deleteLanguageApi(id);
      dispatchMutation({
        type: "update",
        payload: {
          deleteMutation: true,
        },
      });
      toast.success(
        languageResData.message || "Language successfully deleted."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong, please try again later."
      );
    }
  };

  return (
    <>
      <Card style={{ minHeight: "100%", width: "100%" }} className="px-2">
        <CardHeader className="border-bottom px-0">
          <CardTitle>Language</CardTitle>

          <div className="d-flex align-items-center gap-1">
            <div className="d-flex align-items-center gap-1">
              <Label className="">Search</Label>
              <Input
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
            <Button
              color="primary"
              onClick={() => setIsCreateLanguageModalOpened(true)}
            >
              Add Language
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pt-2 px-0 overflow-auto hide-scroll-bar">
          {searchedLanguage.query.trim().length < 2 ? (
            <LanguageTable
              data={language.data}
              currentPage={language.page}
              setCurrentPage={(page) => {
                dispatchLanguage({
                  type: "update",
                  payload: {
                    page,
                    refetch: true,
                    isLoading: true,
                  },
                });
              }}
              pageCount={language.totalPage}
              limit={language.limit}
              setLimit={(limit) => {
                dispatchLanguage({
                  type: "update",
                  payload: {
                    limit,
                    refetch: true,
                    page: 1,
                  },
                });
              }}
              isLoading={language.isLoading}
              openUpdateLanguageModal={openUpdateLanguageModal}
              deleteLanguage={deleteLanguage}
            />
          ) : (
            <LanguageTable
              data={searchedLanguage.data}
              currentPage={searchedLanguage.page}
              setCurrentPage={(page) => {
                dispatchSearchedLanguage({
                  type: "update",
                  payload: {
                    page,
                    refetch: true,
                    isLoading: true,
                  },
                });
              }}
              pageCount={searchedLanguage.totalPage}
              limit={searchedLanguage.limit}
              setLimit={(limit) => {
                dispatchSearchedLanguage({
                  type: "update",
                  payload: {
                    limit,
                    refetch: true,
                    page: 1,
                    isLoading: true,
                  },
                });
              }}
              onSelectedRowsChange={(data) => {
                setSelectedCategory(data);
              }}
              isLoading={searchedLanguage.isLoading}
              openUpdateLanguageModal={openUpdateLanguageModal}
              deleteLanguage={deleteLanguage}
            />
          )}
        </CardBody>
      </Card>

      <CreateLanguageModal
        open={isCreateLanguageModalOpened}
        closeModal={() => setIsCreateLanguageModalOpened(false)}
        setMutation={() => {
          dispatchMutation({
            type: "update",
            payload: {
              createMutation: true,
            },
          });
        }}
      />

      <UpdateLanguageModal
        open={isUpdateLanguageModalOpened}
        closeModal={() => setIsUpdateLanguageModalOpened(false)}
        setMutation={() => {
          dispatchMutation({
            type: "update",
            payload: {
              updateMutation: true,
            },
          });
        }}
        languageId={selectedLanguage}
      />
    </>
  );
};

export default Language;
