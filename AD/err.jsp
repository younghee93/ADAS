<%@page contentType="text/html" pageEncoding="UTF-8" isErrorPage="true" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Error Page</title>
    </head>
    <body>
        <h3>Exception</h3>
        Request that failed: ${pageContext.errorData.requestURI}
        <br />
        Status code: ${pageContext.errorData.statusCode}
        <br />
        Exception: ${pageContext.errorData.throwable}
        <br />
        ${pageContext.errorData.servletName}
    </body>
</html>

