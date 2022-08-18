import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "reactstrap";
import { useState, useReducer, useEffect } from "react";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import LibrarianTable from "@customComponents/librarian/librarianTable/LibrarianTable";
import ViewLibrarianDetailsModal from "@customComponents/modals/librarian/ViewLibrarianDetailsModal";
import { DeleteSweetAlert } from "@customComponents/sweetAlert/SweetAlert";
import getAllLibrarianApi from "@services/librarian/getAllLibrarianApi";
import searchLibrarianApi from "@services/librarian/searchLibrarianApi";
import deleteLibrarianApi from "@services/librarian/deleteLibrarianApi";

const librarianInitialState = {
  data: [],
  totalPage: 1,
  page: 1,
  refetch: false,
  limit: 25,
  isLoading: true,
};

const searchedLibrarianInitialState = {
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

// Reducers functions
function reducerLibrarian(state, action) {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "reset":
      return bookInitialState;
  }
}

function reducerSearchedLibrarian(state, action) {
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

const Librarian = () => {
  const [searchKey, setSearchKey] = useState("");
  const [searchValue] = useDebounce(searchKey, 500);

  const [librarian, dispatchLibrarian] = useReducer(
    reducerLibrarian,
    librarianInitialState
  );
  const [searchedLibrarian, dispatchSearchedLibrarian] = useReducer(
    reducerSearchedLibrarian,
    searchedLibrarianInitialState
  );

  const [mutation, dispatchMutation] = useReducer(
    reducerMutation,
    initialMutationState
  );

  const [selectedLibrarianId, setSelectedLibrarianId] = useState(null);
  const [isViewLibraryDetailsModalOpened, setIsViewLibraryDetailsModelOpened] =
    useState(false);

  // Function to load and set librarian data
  const setLibrarianData = async () => {
    try {
      const librarianResData = await getAllLibrarianApi({
        page: librarian.page,
        count: librarian.limit,
      });

      if (librarian.page !== 1 && !librarianResData.data.docs.length) {
        dispatchLibrarian({
          type: "update",
          payload: {
            page: 1,
            isLoading: false,
            refetch: true,
          },
        });
        return;
      }
      dispatchLibrarian({
        type: "update",
        payload: {
          data: librarianResData.data.docs,
          totalPage: librarianResData.data.totalPages,
          isLoading: false,
          refetch: false,
        },
      });
    } catch {
      dispatchLibrarian({
        type: "update",
        payload: {
          data: [],
          isLoading: false,
          refetch: false,
        },
      });
      toast.error("Facing a problem while loading the librarian data.");
    }

    dispatchMutation({ type: "reset" });
  };

  // Function to load and set the searched librarian data
  const setSearchedLibrarianData = async () => {
    try {
      const searchLibrarianResData = await searchLibrarianApi({
        page: searchedLibrarian.page,
        count: searchedLibrarian.limit,
        query: searchedLibrarian.query,
      });

      if (
        searchedLibrarian.page !== 1 &&
        !searchLibrarianResData.data.docs.length
      ) {
        dispatchSearchedLibrarian({
          type: "update",
          payload: {
            page: 1,
            isLoading: false,
            refetch: true,
          },
        });
        return;
      }

      dispatchSearchedLibrarian({
        type: "update",
        payload: {
          data: searchLibrarianResData.data.docs,
          totalPage: searchLibrarianResData.data.totalPages,
          isLoading: false,
          refetch: false,
        },
      });
    } catch {
      dispatchSearchedLibrarian({
        type: "update",
        payload: {
          data: [],
          isLoading: false,
          refetch: false,
        },
      });

      toast.error(
        "Facing a problem while loading the searched librarian data."
      );
    }

    dispatchMutation({ type: "reset" });
  };

  useEffect(() => {
    dispatchLibrarian({
      type: "update",
      payload: {
        page: 1,
        isLoading: true,
        refetch: true,
      },
    });
  }, []);

  useEffect(() => {
    if (librarian.refetch) setLibrarianData();
  }, [librarian]);

  useEffect(() => {
    if (searchedLibrarian.refetch) setSearchedLibrarianData();
  }, [searchedLibrarian]);

  useEffect(() => {
    if (mutation.createMutation) {
      dispatchLibrarian({
        type: "update",
        payload: {
          page: 1,
          isLoading: false,
          refetch: true,
        },
      });

      dispatchSearchedLibrarian({
        type: "update",
        payload: {
          page: 1,
          isLoading: false,
          refetch: searchedLibrarian.query.trim().length > 2,
        },
      });
    } else if (mutation.updateMutation) {
      dispatchLibrarian({
        type: "update",
        payload: {
          refetch: true,
        },
      });

      dispatchSearchedLibrarian({
        type: "update",
        payload: {
          refetch: searchedLibrarian.query.trim().length > 2,
        },
      });
    } else if (mutation.deleteMutation) {
      dispatchLibrarian({
        type: "update",
        payload: {
          refetch: true,
        },
      });

      dispatchSearchedLibrarian({
        type: "update",
        payload: {
          refetch: searchedLibrarian.query.trim().length > 2,
        },
      });
    }
  }, [mutation]);

  useEffect(() => {
    const searchValueLen = searchValue.trim().length;

    dispatchSearchedLibrarian({
      type: "update",
      payload: {
        refetch: searchValueLen >= 2,
        query: searchValue.trim(),
        isLoading: true,
      },
    });
  }, [searchValue]);

  useEffect(() => {
    if (!isViewLibraryDetailsModalOpened) setSelectedLibrarianId(null);
  }, [isViewLibraryDetailsModalOpened]);

  const openViewLibrarianDetailsModal = (id) => {
    if (!id) return;

    setSelectedLibrarianId(id);
    setIsViewLibraryDetailsModelOpened(true);
  };

  const deleteLibrarian = async (props) => {
    const { id, name } = props;

    const { isConfirmed } = await DeleteSweetAlert({
      text: `Do you want to delete this (${name}) librarian?`,
      confirmButtonText: "Yes, delete it",
    });

    if (!isConfirmed) return;

    try {
      const sellerResData = await deleteLibrarianApi({
        librarianId: id,
        role: "librarian",
      });
      dispatchMutation({
        type: "update",
        payload: {
          updateMutation: true,
        },
      });
      toast.success(sellerResData.message || "Librarian successfully deleted.");
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
          <CardTitle>Librarian</CardTitle>

          <div className="d-flex align-items-center gap-1">
            <div className="d-flex align-items-center gap-1">
              <Label className="">Search</Label>
              <Input
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-2 px-0 overflow-auto hide-scroll-bar">
          {searchedLibrarian.query.trim().length < 2 ? (
            <LibrarianTable
              data={librarian.data}
              currentPage={librarian.page}
              setCurrentPage={(page) => {
                dispatchLibrarian({
                  type: "update",
                  payload: {
                    page,
                    refetch: true,
                    isLoading: true,
                  },
                });
              }}
              pageCount={librarian.totalPage}
              limit={librarian.limit}
              setLimit={(limit) => {
                dispatchLibrarian({
                  type: "update",
                  payload: {
                    limit,
                    refetch: true,
                    page: 1,
                  },
                });
              }}
              isLoading={librarian.isLoading}
              openViewLibrarianDetailsModal={openViewLibrarianDetailsModal}
              deleteLibrarian={deleteLibrarian}
            />
          ) : (
            <LibrarianTable
              data={searchedLibrarian.data}
              currentPage={searchedLibrarian.page}
              setCurrentPage={(page) => {
                dispatchSearchedLibrarian({
                  type: "update",
                  payload: {
                    page,
                    refetch: true,
                  },
                });
              }}
              pageCount={searchedLibrarian.totalPage}
              limit={searchedLibrarian.limit}
              setLimit={(limit) => {
                dispatchSearchedLibrarian({
                  type: "update",
                  payload: {
                    limit,
                    refetch: true,
                    page: 1,
                    isLoading: true,
                  },
                });
              }}
              isLoading={searchedLibrarian.isLoading}
              openViewLibrarianDetailsModal={openViewLibrarianDetailsModal}
              deleteLibrarian={deleteLibrarian}
            />
          )}
        </CardBody>
      </Card>

      <ViewLibrarianDetailsModal
        open={isViewLibraryDetailsModalOpened}
        closeModal={() => setIsViewLibraryDetailsModelOpened(false)}
        librarianId={selectedLibrarianId}
      />
    </>
  );
};

export default Librarian;
