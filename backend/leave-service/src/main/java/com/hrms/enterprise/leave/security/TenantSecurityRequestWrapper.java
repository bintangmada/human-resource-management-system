package com.hrms.enterprise.leave.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Enumeration;

public class TenantSecurityRequestWrapper extends HttpServletRequestWrapper {

    public TenantSecurityRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String getHeader(String name) {
        if ("X-Tenant-ID".equalsIgnoreCase(name)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                return String.valueOf(userDetails.getTenantId());
            }
        }
        if ("X-User-Email".equalsIgnoreCase(name) || "X-Actor-Email".equalsIgnoreCase(name)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                return userDetails.getUsername();
            }
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        if ("X-Tenant-ID".equalsIgnoreCase(name) || "X-User-Email".equalsIgnoreCase(name) || "X-Actor-Email".equalsIgnoreCase(name)) {
            String value = getHeader(name);
            if (value != null) {
                return Collections.enumeration(Collections.singletonList(value));
            }
        }
        return super.getHeaders(name);
    }
}
