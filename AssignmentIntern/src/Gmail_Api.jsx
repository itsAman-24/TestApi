import React, { useEffect, useState } from "react";

const CLIENT_ID; // Client ID
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly"; // Scope for Gmail API
const SECRET_KEY;
const REDIRECT_URL = "http://localhost:5173/";

const GetUserData = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [accessToken, setAccessToken] = useState({});
  const [fetchedData, setFetchedData] = useState([]);

  const generateAuthCode = () => {
    const clientId = CLIENT_ID;
    const redirectUri = REDIRECT_URL;
    const scope = SCOPES;
    const state = "random_string_for_csrf_protection";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(
      scope
    )}&access_type=offline&include_granted_scopes=true&state=${encodeURIComponent(
      state
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&client_id=${encodeURIComponent(clientId)}`;
    window.location.href = authUrl;
  };

  const getAccessToken = async (authorizationCode) => {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: authorizationCode, // This is the authorization code returned by Google
          client_id: CLIENT_ID,
          client_secret: SECRET_KEY,
          redirect_uri: REDIRECT_URL,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Access Token:", data.access_token);
        return data;
      } else {
        console.error("Error fetching access token:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    window.location.href = REDIRECT_URL;
  };

  const handleSignIn = () => {
    generateAuthCode();
  };

  // Fetch Gmail messages
  const fetchUserData = async () => {
    console.log("here is the accessToken obj used to fetch info: ", accessToken);
    try {
      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched Emails:", data);
      setFetchedData(data.messages); // Assuming messages are returned
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  useEffect(() => {
    console.log("Fetched Data State Updated:", fetchedData);
  }, [fetchedData]);

  useEffect(() => {
    if (authToken && Object.keys(accessToken).length === 0) {
      getAccessToken(authToken).then((token) => {
        setAccessToken(token);
      });
    } else if (authToken === null) {
      const params = new URLSearchParams(window.location.search);
      const authorizationCode = params.get("code");
      if (authorizationCode) {
        setIsSignedIn(true);
        setAuthToken(authorizationCode);
      }
    }
  }, [accessToken, authToken]);

  return (
    <div className="app">
      <h1>Gmail API Demo</h1>
      {!isSignedIn ? (
        <button onClick={handleSignIn}>Sign In</button>
      ) : (
        <>
          <button onClick={handleSignOut}>Sign Out</button>
          <button onClick={fetchUserData}>Fetch Emails</button>
        </>
      )}

      {fetchedData.length > 0 && (
        <div id="dataList">
          <ul>
            {fetchedData.map((email, index) => (
              <li key={index}>Email ID: {email.id}</li> // Displaying the message ID
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GetUserData;
