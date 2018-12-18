package teamerExt.jira.webwork.Team;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.google.common.collect.Lists;
import net.java.ao.Query;
import teamerExt.jira.webwork.Project.Project;
import teamerExt.jira.webwork.Project.ProjectService;

import javax.inject.Inject;
import javax.inject.Named;

import java.sql.SQLException;

import static com.google.common.base.Preconditions.checkNotNull;

@Scanned
@Named
public class TeamServiceImpl implements TeamService
{
    @ComponentImport
    private final ActiveObjects ao;


    @Inject
    public TeamServiceImpl(ActiveObjects ao)
    {
        this.ao = checkNotNull(ao);
    }


    @Override
    public Team add(String description) {
        return null;
    }

    @Override
    public Iterable<Team> all()
    {
        final Query query = Query.select();
        return Lists.newArrayList(ao.find(Team.class, query));
    }
    @Override
    public void delete(Team team)
    {
        ao.delete(team);
    }

    @Override
    public Team getTeamById(int teamId) {
        Team[] team = ao.find(Team.class, Query.select().where("ID = ?", teamId));
        return team[0];
    }


}
