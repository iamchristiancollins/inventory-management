"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  ButtonGroup,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const SearchBar = ({ search, handleSearch }) => {
  return (
    <Box
      width="750px"
      height="60px"
      bgcolor="background.paper"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={1}
      borderRadius={2}
      boxShadow={1}
      mb={3}
    >
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        fullWidth
        value={search}
        onChange={handleSearch}
        sx={{ bgcolor: "#f9f9f9", borderRadius: 1 }}
      />
    </Box>
  );
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const updateInventory = async () => {
    const snapshot = query(collection(db, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(db, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(db, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={2}
      bgcolor="#f0f2f5"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      <Box
        width="800px"
        p={3}
        bgcolor="background.paper"
        borderRadius={2}
        boxShadow={3}
      >
        <SearchBar search={search} handleSearch={handleSearch} />
        <Box
          width="100%"
          height="80px"
          bgcolor="primary.main"
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius={2}
          boxShadow={1}
          mb={3}
        >
          <Typography
            variant="h4"
            color="primary.contrastText"
            textAlign="center"
          >
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} overflow="auto" height="400px">
          {inventory
            .filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase())
            )
            .map(({ name, quantity }) => (
              <Box
                key={name}
                display="grid"
                gridTemplateColumns="3fr 2fr 3fr"
                alignItems="center"
                bgcolor="background.paper"
                p={2}
                borderRadius={1}
                boxShadow={1}
                gap={2}
              >
                <Typography
                  variant="body1"
                  color="text.primary"
                  textAlign="left"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.primary"
                  textAlign="center"
                >
                  Quantity: {quantity}
                </Typography>
                <ButtonGroup>
                  <Button variant="contained" onClick={() => addItem(name)}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </ButtonGroup>
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
}
