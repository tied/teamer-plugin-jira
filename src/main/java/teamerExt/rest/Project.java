package teamerExt.rest;

import javax.ws.rs.PathParam;
import javax.ws.rs.*;
import org.json.simple.JSONValue;

import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.jira.util.json.JSONException;
import com.atlassian.jira.util.json.JSONObject;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugins.rest.common.security.AnonymousAllowed;
import teamerExt.jira.webwork.Project.ProjectMember;
import teamerExt.jira.webwork.Project.ProjectService;
import teamerExt.jira.webwork.Project.ProjectTeam;


import java.util.ArrayList;
import java.util.List;

@Produces ({ MediaType.APPLICATION_JSON })
@Consumes ({ MediaType.APPLICATION_JSON })
@AnonymousAllowed
@Path ("project")
public class Project {

    //odpowiada za np. dodawanie projektu do bazy
    private final ProjectService projectService;
    CacheControl cacheControl;
    @ComponentImport
    private final ActiveObjects ao;

    public Project(ProjectService projectService,ActiveObjects ao) {
        this.projectService = projectService;
        CacheControl cacheControl = new CacheControl();
        cacheControl.setNoCache(true);
        this.ao = ao;
    }
    @GET
    public List<ProjectModel> getAll() {

        final Iterable<teamerExt.jira.webwork.Project.Project> projects = projectService.all();
        List<ProjectModel> projectModels = new ArrayList<>();

        for(teamerExt.jira.webwork.Project.Project project : projects) {
            ProjectModel projectModel = new ProjectModel();
            projectModel.setLabel(project.getName());
            projectModel.setValue(project.getID());
            projectModels.add(projectModel);
        }

        return projectModels;
    }
    @DELETE
    @Path("{projectId}/{teamId}")
    public Response delete(@PathParam("projectId") final Integer projectId,@PathParam("teamId") final Integer teamId) throws Exception {
        teamerExt.jira.webwork.Project.Project project =  this.projectService.getProjectById(projectId);
        this.projectService.delete(project);
        ProjectTeam projectTeam = this.projectService.getProjectByTeamId(teamId,projectId);
        this.projectService.delete(projectTeam);
        return Response.ok().build();
    }

    @GET
    @Path("{id}")
    public  ArrayList<ProjectModel> getProjectsByTeamId(@PathParam ("id") final int teamId){

        Iterable<ProjectTeam> allProjectsWithTeams = projectService.allProjectsByTeam(teamId);


        ArrayList<ProjectModel> projectModelArrayList = new ArrayList<>();
        for(ProjectTeam projectTeam : allProjectsWithTeams) {
            try {
                teamerExt.jira.webwork.Project.Project project = projectService.getProjectById(projectTeam.getProjectId());
                ProjectModel projectModel = new ProjectModel();
                projectModel.setIncome(project.getIncome());
                projectModel.setName(project.getName());
                projectModel.setTeamId(projectTeam.getTeamId());
                projectModel.setProjectId(projectTeam.getProjectId());
                projectModelArrayList.add(projectModel);
            } catch (NullPointerException e){
                System.out.println("NULL");
            }

        }
        return projectModelArrayList;
    }

    //add project to database
    @POST
    @Path("{id}")
    public Response createProject(ProjectModel projectModel) throws JSONException {
        teamerExt.jira.webwork.Project.Project projectModel1 = ao.create(teamerExt.jira.webwork.Project.Project.class);
        Integer projectId;

        projectModel1.setName(projectModel.getLabel());
        projectModel1.save();


        projectId = projectModel1.getID();
        JSONObject obj=new JSONObject();
        obj.put("projectId",projectId);

        return Response
                .status(Response.Status.OK)
                .entity(JSONValue.toJSONString(obj))
                .type(MediaType.APPLICATION_JSON).build();
    }

    private ProjectModel convertProjectObjectToModel(teamerExt.jira.webwork.Project.Project project){
        ProjectModel projectModel = new ProjectModel();
        projectModel.setIncome(project.getIncome());
        projectModel.setLabel(project.getName());
        return projectModel;
    }
}
