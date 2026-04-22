package com.anaaj.servlet;

import jakarta.servlet.annotation.WebServlet;
import org.h2.server.web.JakartaWebServlet;

/**
 * Provides an interactive Web-based SQL Terminal to query the purely in-memory database.
 * Accessible at: http://localhost:8080/AnaajApp/console/
 */
@WebServlet(value = "/console/*", loadOnStartup = 1)
public class H2ConsoleServlet extends JakartaWebServlet {
}
