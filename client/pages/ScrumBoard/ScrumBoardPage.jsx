import React, { useState, useContext, useEffect } from 'react';
import { userContext, teamContext, pageContext } from '../../context';
import MainContainer from './components/MainContainer';


const ScrumBoardPage = () => {
  const { user } = useContext(userContext);
  const { team } = useContext(teamContext);
  const { lastPage } = useContext(pageContext);
  const [teamName, setTeamName] = useState(findTeamName(user, team));

  useEffect(() => {
    lastPage.current = '/ScrumBoardPage';
  }, []);

  return (
    <>
      <h2 id='boardTitle'>Team: {teamName}</h2>
      <MainContainer user={ user } team={ team } />
    </>
  );
};

export default ScrumBoardPage;



function findTeamName(user, team) {
  if (user?.userTeams && team) {
    for (const userTeam of user.userTeams) {
      if (userTeam.id === team) {
        return userTeam.team_name;
      }
    }
  }
}