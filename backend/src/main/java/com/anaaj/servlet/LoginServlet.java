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
            resp.sendRedirect(req.getContextPath() + "/pages/login.html");
            return;
        }

        // Already logged in → redirect home
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            resp.sendRedirect(req.getContextPath() + "/pages/index.html");
            return;
        }

        resp.sendRedirect(req.getContextPath() + "/pages/login.html");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String email    = req.getParameter("email");
        String password = req.getParameter("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            resp.sendRedirect(req.getContextPath() + "/pages/login.html?error=empty");
            return;
        }

        try {
            User user = userDAO.loginUser(email.trim(), password);
            if (user == null) {
                resp.sendRedirect(req.getContextPath() + "/pages/login.html?error=invalid");
                return;
            }

            HttpSession session = req.getSession(true);
            session.setAttribute("userId",   user.getId());
            session.setAttribute("userName", user.getName());
            session.setAttribute("role",     user.getRole());
            session.setMaxInactiveInterval(60 * 60); // 1 hour

            if ("admin".equals(user.getRole())) {
                resp.sendRedirect(req.getContextPath() + "/pages/admin/products.html");
            } else {
                String returnUrl = req.getParameter("return");
                resp.sendRedirect(returnUrl != null && !returnUrl.isBlank()
                        ? returnUrl
                        : req.getContextPath() + "/pages/index.html");
            }

        } catch (Exception e) {
            getServletContext().log("LoginServlet error", e);
            resp.sendRedirect(req.getContextPath() + "/pages/login.html?error=server");
        }
    }
}
