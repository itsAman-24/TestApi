import React, { useEffect, useState } from "react";

const CLIENT_ID; //Client ID
const SCOPES = "https://www.googleapis.com/auth/contacts"; // Scopes for the APIs you need access to
const SECRET_KEY;
const REDIRECT_URL = "http://localhost:5173/";

const GetUserData = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [accessToken, setAccessToken] = useState({});
  const [fetchedData, setFetchedData] = useState();

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.log("Refresh Token:", data.refresh_token);
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

  //function is responsible to fetch users data

  const fetchUserData = async () => {
    console.log(
      "here is the accessToken obj used to fetch info : ",
      accessToken
    );
    // logic to fetch data here
    try {
      const response = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setFetchedData(data);
      // console.log(fetchedData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // setError('Failed to fetch profile data');
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
      // if authToken is not present then we need to authorize first and then need to get the authToken from url param
      const params = new URLSearchParams(window.location.search);
      const authorizationCode = params.get("code");
      if (authorizationCode) {
        setIsSignedIn(true);
        setAuthToken(authorizationCode);
      }
    }
  }, [accessToken, authToken, generateAuthCode]);

  // console.log(accessToken, "accessToken here");

  return (
    <div className="app">
      <h1>People API</h1>
      {!isSignedIn ? (
        <button onClick={handleSignIn}>Sign In</button>
      ) : (
        <>
          <button onClick={handleSignOut}>Sign Out</button>
          <button onClick={fetchUserData}>Fetch Data</button>
        </>
      )}

      {fetchedData && (
        <div id="dataList">
          <ul>
            {fetchedData.emailAddresses &&
              fetchedData.emailAddresses.map((email, index) => (
                <li key={index}>Email:   {email.value}</li>
              ))}

            {fetchedData.names &&
              fetchedData.names.map((name, index) => (
                <li key={index}>Name:   {name.displayName}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GetUserData;
