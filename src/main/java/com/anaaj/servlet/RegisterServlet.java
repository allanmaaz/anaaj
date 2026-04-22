package com.anaaj.servlet;

import com.anaaj.dao.UserDAO;
import com.anaaj.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/** Handles new user registration (GET → show form, POST → insert user). */
@WebServlet("/register")
public class RegisterServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            resp.sendRedirect("/");
            return;
        }
        resp.sendRedirect("/register");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        java.io.PrintWriter out = resp.getWriter();

        String name     = req.getParameter("name");
        String email    = req.getParameter("email");
        String password = req.getParameter("password");
        String phone    = req.getParameter("phone");
        String address  = req.getParameter("address");

        if (isBlank(name) || isBlank(email) || isBlank(password)) {
            resp.setStatus(400);
            out.print("{\"error\":\"empty\"}");
            return;
        }

        if (password.length() < 6) {
            resp.setStatus(400);
            out.print("{\"error\":\"shortpwd\"}");
            return;
        }

        try {
            if (userDAO.emailExists(email.trim())) {
                resp.setStatus(409);
                out.print("{\"error\":\"duplicate\"}");
                return;
            }

            User user = new User(name.trim(), email.trim(), password, phone, address, "user");
            int newId = userDAO.registerUser(user);

            if (newId == -1) {
                resp.setStatus(500);
                out.print("{\"error\":\"server\"}");
                return;
            }

            HttpSession session = req.getSession(true);
            session.setAttribute("userId",   newId);
            session.setAttribute("userName", name.trim());
            session.setAttribute("role",     "user");
            session.setMaxInactiveInterval(60 * 60);

            out.print("{\"success\":true}");
        } catch (Exception e) {
            getServletContext().log("RegisterServlet error", e);
            resp.setStatus(500);
            out.print("{\"error\":\"server\"}");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
