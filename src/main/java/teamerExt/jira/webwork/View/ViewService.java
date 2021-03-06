package teamerExt.jira.webwork.View;

import teamerExt.jira.webwork.Team.Team;

import java.util.ArrayList;

public interface ViewService {

    public ArrayList<Team> getAllViews();

    public View getViewById(String viewId);

    public Integer cloneView(int viewId) throws Exception;

    public void delete(View view) throws Exception;

    public void deleteAllTeamsByViewId(String viewId) throws Exception;
}
