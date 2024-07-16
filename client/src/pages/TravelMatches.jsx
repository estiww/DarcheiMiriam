import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, TextField, CircularProgress, Box } from "@mui/material";
import sendRefreshToken from "../components/SendRefreshToken";
import { useNavigate } from "react-router-dom";

const TravelMatches = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const navigate = useNavigate();


  const fetchTravelMatches = async (currentPage) => {
    try {
      setLoading(true);
      const limit = 4;
      const response = await fetch(`http://localhost:3000/travelMatches?limit=${limit}&offset=${currentPage * limit}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshResponse = await sendRefreshToken();
          if (refreshResponse.status === 440) {
            throw new Error("440");
          }
          return fetchTravelMatches(currentPage);
        }
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();

      setMatches(prevMatches => {
        const newMatches = data.filter(newMatch => !prevMatches.some(match => match.TravelMatchId === newMatch.TravelMatchId));
        return [...prevMatches, ...newMatches];
      });
      setHasMore(data.length === limit);
      setLoading(false);
      setSearchError("");
    } catch (error) {
      setError(error.message);
      if (error.message === "440") {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelMatches(0);
  }, []); // This will run only once on component mount

  useEffect(() => {
    if (page > 0) {
      fetchTravelMatches(page);
    }
  }, [page]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedMatches = () => {
    let sortedMatches = [...matches];
    if (sortConfig.key) {
      sortedMatches.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedMatches;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setSearchError(""); // Clear previous search error message on new search
  };

  const matchesToShow = searchTerm.trim().length === 0 ? sortedMatches() : sortedMatches().filter((match) =>
    Object.values(match).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const highlightSearchTerm = (text) => {
    if (searchTerm.trim().length === 0) {
      return text;
    }

    const lowerCaseText = text.toLowerCase();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const index = lowerCaseText.indexOf(lowerCaseSearchTerm);

    if (index === -1) {
      return text;
    }

    const firstPart = text.substring(0, index);
    const highlightedPart = text.substring(index, index + searchTerm.length);
    const lastPart = text.substring(index + searchTerm.length);

    return (
      <>
        {firstPart}
        <span style={{ backgroundColor: "#ffff00", fontWeight: "bold" }}>{highlightedPart}</span>
        {lastPart}
      </>
    );
  };

  const createSortHandler = (key, label) => {
    return (
      <TableSortLabel
        active={sortConfig.key === key}
        direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
        onClick={() => requestSort(key)}
      >
        {label}
      </TableSortLabel>
    );
  };

  useEffect(() => {
    if (searchTerm.trim().length > 0 && matchesToShow.length === 0) {
      setSearchError("No matching results found.");
    } else {
      setSearchError("");
    }
  }, [searchTerm, matchesToShow]);

  const lastMatchElementRef = useCallback((node) => {
    if (loading || !hasMore) return;
  
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
  
    if (node) observer.current.observe(node);
  
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore]);

  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold">
          התאמות נסיעה
        </Typography>
        {error && <Typography color="error" align="center" mb={2}>{error}</Typography>}
        <Box display="flex" justifyContent="center" mb={3}>
          <TextField
            label="חיפוש"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: '50%' }}
          />
        </Box>
        
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{createSortHandler('VolunteerFullName', 'שם המתנדב')}</TableCell>
                <TableCell>{createSortHandler('MatchDate', 'תאריך')}</TableCell>
                <TableCell>{createSortHandler('MatchTime', 'שעה')}</TableCell>
                <TableCell>{createSortHandler('TravelOrigin', 'מוצא')}</TableCell>
                <TableCell>{createSortHandler('TravelDestination', 'יעד')}</TableCell>
                <TableCell>{createSortHandler('TravelTime', 'זמן נסיעה')}</TableCell>
                <TableCell>{createSortHandler('NumberOfPassengers', 'מספר נוסעים')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchesToShow.map((match, index) => (
                <TableRow 
                  key={match.TravelMatchId} 
                  ref={matchesToShow.length === index + 1 ? lastMatchElementRef : null}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{highlightSearchTerm(`${match.VolunteerFirstName} ${match.VolunteerLastName}`)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.MatchDate)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.MatchTime)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.TravelOrigin)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.TravelDestination)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.TravelTime)}</TableCell>
                  <TableCell>{highlightSearchTerm(match.NumberOfPassengers.toString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {searchError && <Typography color="error" align="center" mt={2}>{searchError}</Typography>}
        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TravelMatches;
