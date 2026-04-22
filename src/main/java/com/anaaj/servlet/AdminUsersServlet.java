package com.anaaj.servlet;

import com.anaaj.dao.UserDAO;
import com.anaaj.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import com.google.gson.Gson;

@WebServlet("/api/admin/users")
public class AdminUsersServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson    gson    = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || !"admin".equals(session.getAttribute("role"))) {
            resp.setStatus(403);
            out.print("{\"error\":\"Forbidden\"}");
            return;
        }

        try {
            int userId = (int) session.getAttribute("userId");
            User currentUser = userDAO.getUserById(userId);
            if (currentUser == null || (!currentUser.getEmail().contains("maazimdad") && !currentUser.getEmail().equals("admin@anaaj.com"))) {
                resp.setStatus(403);
                out.print("{\"error\":\"Master Admin Access Only\"}");
                return;
            }

            List<User> users = userDAO.getAllUsers();
            for (User u : users) {
                u.setPassword(null); // Do not expose hashed passwords!
            }
            out.print(gson.toJson(users));
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        HttpSession session = req.getSession(false);
        if (session == null || !"admin".equals(session.getAttribute("role"))) {
            resp.setStatus(403); out.print("{\"error\":\"Forbidden\"}"); return;
        }

        try {
            int userId = (int) session.getAttribute("userId");
            User currentUser = userDAO.getUserById(userId);
            if (currentUser == null || (!currentUser.getEmail().contains("maazimdad") && !currentUser.getEmail().equals("admin@anaaj.com"))) {
                resp.setStatus(403); out.print("{\"error\":\"Master Admin Access Only\"}"); return;
            }

            int targetId = Integer.parseInt(req.getParameter("targetId"));
            String newRole = req.getParameter("newRole");

            if (!"admin".equals(newRole) && !"user".equals(newRole)) {
                resp.setStatus(400); out.print("{\"error\":\"Invalid role\"}"); return;
            }

            boolean ok = userDAO.updateUserRole(targetId, newRole);
            if (ok) {
                out.print("{\"success\":true}");
            } else {
                resp.setStatus(404); out.print("{\"error\":\"User not found\"}");
            }
        } catch (Exception e) {
            resp.setStatus(500); out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
