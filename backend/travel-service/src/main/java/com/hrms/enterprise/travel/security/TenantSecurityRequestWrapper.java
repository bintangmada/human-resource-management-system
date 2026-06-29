package com.hrms.enterprise.travel.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.*;

public class TenantSecurityRequestWrapper extends HttpServletRequestWrapper {

    private final Map<String, String> customHeaders = new HashMap<>();

    public TenantSecurityRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void putHeader(String name, String value) {
        this.customHeaders.put(name, value);
    }

    @Override
    public String getHeader(String name) {
        String headerValue = customHeaders.get(name);
        return headerValue != null ? headerValue : super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        names.addAll(customHeaders.keySet());
        return Collections.enumeration(names);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        String headerValue = customHeaders.get(name);
        if (headerValue != null) {
            return Collections.enumeration(Collections.singletonList(headerValue));
        }
        return super.getHeaders(name);
    }
}
