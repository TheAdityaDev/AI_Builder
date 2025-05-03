"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, GithubIcon, Library } from "lucide-react";
import React, { useState } from "react";

const ProfileGitHubUser = () => {
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGitHubProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      setProfileData(data);

      // Fetch repositories
      const reposResponse = await fetch(data.repos_url);
      const reposData = await reposResponse.json();
      setRepos(reposData);
    } catch (error) {
      console.error("Error fetching GitHub profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <h4 className="mb-5">
          <GithubIcon className="inline-block mr-2" />
          Fetch Your Git Hub Profile...
        </h4>
        <Input
          placeholder="Enter GitHub username"
          className="userInp"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={fetchGitHubProfile} className="mt-5 cursor-pointer">
          {isLoading ? <>Fetching....</> : <>Search Profile</>}
        </Button>
        {profileData && (
          <div>
            <div className="flex relative">
              <img
                src={profileData.avatar_url}
                alt="Avatar"
                className="h-[400px] w-[400px] rounded-full mt-5"
              />
              <div className="pl-6">
                <h1 className="text-4xl">{profileData.name}</h1>
                <h2 className="mt-4">{profileData.bio}</h2>
                <div className="flex gap-10 mt-5">
                  <h4 variant="body2">Followers: {profileData.followers}</h4>
                  <h4 variant="body2">Following: {profileData.following}</h4>
                </div>
                <div className="flex gap-10 mt-5">
                  <h2 variant="body2">
                    <Clock className="inline-block mr-2" />
                    Created At:{" "}
                    {new Date(profileData.created_at).toLocaleDateString()}
                  </h2>
                  <h2 variant="body2">
                    <Clock className="inline-block mr-2" />
                    Updated At:{" "}
                    {new Date(profileData.updated_at).toLocaleDateString()}
                  </h2>
                </div>
                <div className="mt-5 flex ">
                  <Library className="inline-block mr-2" />
                  <h4 className="mb-2">Repositories:</h4>
                </div>
                <div className="pl-10 flex flex-col">
                  {repos.map((repo) => (
                    <Button
                      key={repo.id}
                      onClick={() => window.open(repo.html_url, "_blank")}
                      className="mb-2 cursor-pointer"
                      variant="outline"
                    >
                      {repo.name}
                    </Button>
                  ))}
                </div>
               
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileGitHubUser;
