package org.esupportail.smsuapiadmin.web;

import java.io.IOException;
import javax.portlet.*;

import org.esupportail.commons.context.ApplicationContextHolder;
import org.springframework.context.ApplicationContext;
import org.esupportail.smsu.web.ServletContextWrapper;

public class StartPagePortlet extends GenericPortlet {
	
   public void init (PortletConfig portletConfig) throws UnavailableException, PortletException
   {
      super.init( portletConfig );
   }

   public void doView(RenderRequest request, RenderResponse response)
                      throws PortletException, IOException
   {
       String page = getWebWidgetHtml(new ServletContextWrapper(getPortletContext()), getRequestURI(request));
       response.setContentType("text/html");
       response.getWriter().print(page);
    }

    static public String getRequestURI(PortletRequest request) {
	return (String) request.getAttribute(/* JSR168 PLT.16.3.1 */ "javax.servlet.include.context_path");
    }

    static public String getWebWidgetHtml(ServletContextWrapper context, String baseURL) throws IOException {
		// need <bean id="..." class="org.esupportail.commons.context.ApplicationContextHolder" />
		ApplicationContext applicationContext = ApplicationContextHolder.getContext();
		StartPage startPage = (StartPage) applicationContext.getBean("StartPage");

    	String s = StartPage.getHtmlTemplate(context, "/WEB-INF/WebWidget-template.html");
    	String idpId = null; // would need getting it from "user-attribute"s or from a channel param?
		return startPage.instantiateTemplate(context, startPage.createEnv(baseURL, true, idpId, false), s);
    }

}
