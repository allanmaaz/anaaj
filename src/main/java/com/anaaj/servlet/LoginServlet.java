package com.anaaj.servlet;

import com.anaaj.dao.UserDAO;
import com.anaaj.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** Handles login (GET → show form, POST → authenticate) and logout. */
@WebServlet(urlPatterns = {"/login", "/logout"})
public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String path = req.getServletPath();

        if ("/logout".equals(path)) {
            HttpSession session = req.getSession(false);
            if (session != null) session.invalidate();
            resp.setStatus(200);
            resp.setContentType("application/json");
            resp.getWriter().print("{\"success\":true}");
            return;
        }

        // Forward GET /login to the React frontend (index.html)
        // We use forward instead of redirect to preserve the URL fragment (#access_token)
        req.getRequestDispatcher("/index.html").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        java.io.PrintWriter out = resp.getWriter();

        String email    = req.getParameter("email");
        String password = req.getParameter("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            resp.setStatus(400);
            out.print("{\"error\":\"empty\"}");
            return;
        }

        try {
            User user = userDAO.loginUser(email.trim(), password);
            if (user == null) {
                resp.setStatus(401);
                out.print("{\"error\":\"invalid\"}");
                return;
            }

            HttpSession session = req.getSession(true);
            session.setAttribute("userId",   user.getId());
            session.setAttribute("userName", user.getName());
            session.setAttribute("role",     user.getRole());
            session.setMaxInactiveInterval(60 * 60); // 1 hour

            out.print("{\"success\":true, \"role\":\"" + user.getRole() + "\"}");
        } catch (Exception e) {
            getServletContext().log("LoginServlet error", e);
            resp.setStatus(500);
            out.print("{\"error\":\"server\"}");
        }
    }
}
