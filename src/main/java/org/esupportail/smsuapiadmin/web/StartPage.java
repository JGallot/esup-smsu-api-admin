package org.esupportail.smsuapiadmin.web;
 
import java.io.IOException;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.esupportail.smsu.services.UrlGenerator;
import org.springframework.beans.factory.annotation.Autowired;

public class StartPage implements org.springframework.web.HttpRequestHandler {

    @Autowired private UrlGenerator urlGenerator;

    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
	ServletContext context = request.getSession().getServletContext();
	boolean isWebWidget = request.getServletPath().startsWith("/WebWidget");
	boolean genTestStaticJsonPage = request.getServletPath().equals("/GenTestStaticJsonPage");
	String baseURL = genTestStaticJsonPage ? ".." : urlGenerator.baseURL(request);
	String template = getHtmlTemplate(context, "/WEB-INF/WebWidget-template.html");
	String page = instantiateWebWidgetHtml(template, baseURL, isWebWidget, genTestStaticJsonPage);
	if (!isWebWidget) 
	    page = getStartPageHtml(context, page);	
	String type = "text/html; charset=UTF-8";
	if (request.getServletPath().endsWith(".js")) {
	    type = "application/x-javascript";
	    page = "document.write(" + new ObjectMapper().writeValueAsString(page) + ");";
	}

	response.setContentType(type);
        response.getWriter().print(page);
    }

    private String getStartPageHtml(ServletContext context, String webWidget) throws IOException {
	String s = getHtmlTemplate(context, "/WEB-INF/StartPage-template.html");
	return instantiateTemplate(s, "webWidget", webWidget);
    }

    public String instantiateWebWidgetHtml(String template, String baseURL, boolean isWebWidget) {
    	return instantiateWebWidgetHtml(template, baseURL, isWebWidget, false);
    }

    public String instantiateWebWidgetHtml(String template, String baseURL, boolean isWebWidget, boolean genTestStaticJsonPage) {
	String s = template;
	s = instantiateTemplate(s, "baseURL", baseURL);
	s = instantiateTemplate(s, "loginURL", genTestStaticJsonPage ? "test/login.jsonp" : "rest/login");
    s = instantiateTemplate(s, "isWebWidget", ""+isWebWidget);
    s = instantiateTemplate(s, "useTestStaticJson", ""+genTestStaticJsonPage);
	return s;
    }

    static public String instantiateTemplate(String template, String var, String value) {
	return template.replaceAll(Pattern.quote("{{serverSide." + var + "}}"), value);
    }

    static public String getHtmlTemplate(ServletContext context, String path) throws IOException {
	return IOUtils.toString(context.getResourceAsStream(path), "UTF-8");
    }
}
