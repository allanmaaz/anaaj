package com.anaaj.servlet;

import com.anaaj.dao.UserDAO;
import com.anaaj.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;

/**
 * Returns current user profile and handles profile updates.
 * GET  /api/profile → returns logged-in user as JSON
 * POST /api/profile → updates name, phone, address
 */
@WebServlet("/api/profile")
public class ProfileServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson    gson    = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\"error\":\"Unauthorized\"}");
            return;
        }

        try {
            int userId = (int) session.getAttribute("userId");
            User user = userDAO.getUserById(userId);
            if (user == null) { resp.setStatus(404); out.print("{\"error\":\"User not found\"}"); return; }

            // Don't expose hashed password to frontend
            user.setPassword(null);
            out.print(gson.toJson(user));

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401); out.print("{\"error\":\"Unauthorized\"}"); return;
        }

        try {
            int userId = (int) session.getAttribute("userId");
            String name    = req.getParameter("name");
            String phone   = req.getParameter("phone");
            String address = req.getParameter("address");

            User user = new User();
            user.setId(userId);
            user.setName(name != null ? name.trim() : "");
            user.setPhone(phone);
            user.setAddress(address);

            boolean ok = userDAO.updateUser(user);

            if (ok && name != null && !name.isBlank()) {
                session.setAttribute("userName", name.trim());
            }

            out.print("{\"success\":" + ok + "}");

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
