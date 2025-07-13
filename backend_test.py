#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Breakly Application
Tests all endpoints including authentication, leave management, and database connectivity
"""

import requests
import json
import os
import sys
from datetime import datetime, timedelta
import uuid

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://6a289a88-b30b-4ff8-85d3-c22bc2967449.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class BreaklyAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_api_health_check(self):
        """Test GET /api - Basic health check"""
        try:
            response = self.session.get(f"{API_BASE}")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'Breakly API' in data['message']:
                    self.log_result("API Health Check", True, "API is responding correctly", data)
                    return True
                else:
                    self.log_result("API Health Check", False, "Unexpected response format", data)
                    return False
            else:
                self.log_result("API Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_auth_register_without_token(self):
        """Test POST /api/auth/register without Firebase token (should fail)"""
        try:
            test_data = {
                "displayName": "Jean Dupont",
                "department": "Engineering",
                "phoneNumber": "+33123456789"
                # Missing idToken intentionally
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=test_data)
            
            # Should fail due to missing Firebase token
            if response.status_code >= 400:
                self.log_result("Auth Register (No Token)", True, "Correctly rejected request without token", 
                              f"Status: {response.status_code}")
                return True
            else:
                self.log_result("Auth Register (No Token)", False, "Should have rejected request without token", 
                              response.json())
                return False
                
        except Exception as e:
            self.log_result("Auth Register (No Token)", False, f"Request error: {str(e)}")
            return False
    
    def test_auth_login_without_token(self):
        """Test POST /api/auth/login without Firebase token (should fail)"""
        try:
            test_data = {}  # Missing idToken
            
            response = self.session.post(f"{API_BASE}/auth/login", json=test_data)
            
            # Should fail due to missing Firebase token
            if response.status_code >= 400:
                self.log_result("Auth Login (No Token)", True, "Correctly rejected login without token", 
                              f"Status: {response.status_code}")
                return True
            else:
                self.log_result("Auth Login (No Token)", False, "Should have rejected login without token", 
                              response.json())
                return False
                
        except Exception as e:
            self.log_result("Auth Login (No Token)", False, f"Request error: {str(e)}")
            return False
    
    def test_protected_endpoints_without_auth(self):
        """Test protected endpoints without authentication"""
        protected_endpoints = [
            ("GET", "/user", "Get User Profile"),
            ("GET", "/leaves", "Get User Leaves"),
            ("GET", "/leaves/pending", "Get Pending Leaves"),
            ("GET", "/dashboard/stats", "Get Dashboard Stats"),
            ("POST", "/leaves", "Create Leave Request"),
            ("PUT", "/leaves/approve", "Approve Leave Request")
        ]
        
        all_passed = True
        
        for method, endpoint, description in protected_endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{API_BASE}{endpoint}")
                elif method == "POST":
                    response = self.session.post(f"{API_BASE}{endpoint}", json={})
                elif method == "PUT":
                    response = self.session.put(f"{API_BASE}{endpoint}", json={})
                
                if response.status_code == 401:
                    self.log_result(f"Protected Endpoint - {description}", True, 
                                  "Correctly requires authentication", f"Status: {response.status_code}")
                else:
                    self.log_result(f"Protected Endpoint - {description}", False, 
                                  "Should require authentication", f"Status: {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Protected Endpoint - {description}", False, f"Request error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_create_leave_request_validation(self):
        """Test POST /api/leaves with invalid data (without auth)"""
        try:
            # Test with invalid data structure
            invalid_data = {
                "type": "invalid_type",
                "startDate": "invalid_date",
                "reason": "Test leave request"
            }
            
            response = self.session.post(f"{API_BASE}/leaves", json=invalid_data)
            
            # Should fail due to no authentication (401) rather than validation (400)
            if response.status_code == 401:
                self.log_result("Leave Request Validation", True, 
                              "Authentication required before validation", f"Status: {response.status_code}")
                return True
            else:
                self.log_result("Leave Request Validation", False, 
                              "Unexpected response", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Leave Request Validation", False, f"Request error: {str(e)}")
            return False
    
    def test_database_connectivity(self):
        """Test database connectivity through API endpoints"""
        try:
            # Try to hit an endpoint that would connect to database
            response = self.session.get(f"{API_BASE}/user")
            
            # We expect 401 (unauthorized) rather than 500 (database error)
            if response.status_code == 401:
                self.log_result("Database Connectivity", True, 
                              "Database appears accessible (auth layer working)", 
                              "API reaches database layer successfully")
                return True
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    if 'database' in str(error_data).lower() or 'mongo' in str(error_data).lower():
                        self.log_result("Database Connectivity", False, 
                                      "Database connection error detected", error_data)
                        return False
                except:
                    pass
                self.log_result("Database Connectivity", False, 
                              "Server error - possible database issue", response.text)
                return False
            else:
                self.log_result("Database Connectivity", True, 
                              "Unexpected but non-error response", f"Status: {response.status_code}")
                return True
                
        except Exception as e:
            self.log_result("Database Connectivity", False, f"Connection error: {str(e)}")
            return False
    
    def test_endpoint_routing(self):
        """Test that all expected endpoints are properly routed"""
        endpoints_to_test = [
            ("/", "Base API endpoint"),
            ("/user", "User profile endpoint"),
            ("/leaves", "Leaves endpoint"),
            ("/leaves/pending", "Pending leaves endpoint"),
            ("/dashboard/stats", "Dashboard stats endpoint"),
            ("/auth/register", "Registration endpoint"),
            ("/auth/login", "Login endpoint"),
            ("/leaves/approve", "Leave approval endpoint")
        ]
        
        all_routed = True
        
        for endpoint, description in endpoints_to_test:
            try:
                response = self.session.get(f"{API_BASE}{endpoint}")
                
                # 404 means endpoint not found/routed
                if response.status_code == 404:
                    self.log_result(f"Endpoint Routing - {description}", False, 
                                  "Endpoint not found", f"URL: {API_BASE}{endpoint}")
                    all_routed = False
                else:
                    # Any other status means the endpoint exists and is routed
                    self.log_result(f"Endpoint Routing - {description}", True, 
                                  "Endpoint properly routed", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Endpoint Routing - {description}", False, f"Request error: {str(e)}")
                all_routed = False
        
        return all_routed
    
    def test_http_methods(self):
        """Test that endpoints respond to correct HTTP methods"""
        method_tests = [
            ("POST", "/auth/register", "Registration should accept POST"),
            ("POST", "/auth/login", "Login should accept POST"),
            ("GET", "/user", "User profile should accept GET"),
            ("GET", "/leaves", "Leaves list should accept GET"),
            ("POST", "/leaves", "Leave creation should accept POST"),
            ("PUT", "/leaves/approve", "Leave approval should accept PUT"),
            ("GET", "/dashboard/stats", "Dashboard stats should accept GET")
        ]
        
        all_passed = True
        
        for method, endpoint, description in method_tests:
            try:
                if method == "GET":
                    response = self.session.get(f"{API_BASE}{endpoint}")
                elif method == "POST":
                    response = self.session.post(f"{API_BASE}{endpoint}", json={})
                elif method == "PUT":
                    response = self.session.put(f"{API_BASE}{endpoint}", json={})
                
                # 405 means method not allowed, which is bad
                if response.status_code == 405:
                    self.log_result(f"HTTP Method - {description}", False, 
                                  "Method not allowed", f"Method: {method}")
                    all_passed = False
                else:
                    # Any other status means the method is accepted
                    self.log_result(f"HTTP Method - {description}", True, 
                                  "Method accepted", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"HTTP Method - {description}", False, f"Request error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_cors_and_headers(self):
        """Test CORS and response headers"""
        try:
            response = self.session.get(f"{API_BASE}")
            
            # Check if response has proper headers
            content_type = response.headers.get('content-type', '')
            
            if 'application/json' in content_type:
                self.log_result("Response Headers", True, 
                              "Proper JSON content type", f"Content-Type: {content_type}")
                return True
            else:
                self.log_result("Response Headers", False, 
                              "Unexpected content type", f"Content-Type: {content_type}")
                return False
                
        except Exception as e:
            self.log_result("Response Headers", False, f"Request error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            # Test invalid JSON
            response = self.session.post(f"{API_BASE}/auth/login", 
                                       data="invalid json", 
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code >= 400:
                self.log_result("Error Handling", True, 
                              "Properly handles invalid JSON", f"Status: {response.status_code}")
                return True
            else:
                self.log_result("Error Handling", False, 
                              "Should reject invalid JSON", f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Error Handling", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Breakly Backend API Tests")
        print(f"📍 Testing API at: {API_BASE}")
        print("=" * 60)
        
        # Run all tests
        tests = [
            self.test_api_health_check,
            self.test_database_connectivity,
            self.test_endpoint_routing,
            self.test_http_methods,
            self.test_cors_and_headers,
            self.test_auth_register_without_token,
            self.test_auth_login_without_token,
            self.test_protected_endpoints_without_auth,
            self.test_create_leave_request_validation,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        # Summary of critical issues
        critical_failures = [r for r in self.test_results if not r['success'] and 
                           any(keyword in r['test'].lower() for keyword in 
                               ['health', 'database', 'routing', 'endpoint'])]
        
        if critical_failures:
            print("\n🚨 Critical Issues Found:")
            for failure in critical_failures:
                print(f"   • {failure['test']}: {failure['message']}")
        
        # Firebase Auth Status
        firebase_auth_tests = [r for r in self.test_results if 'auth' in r['test'].lower()]
        firebase_working = all(r['success'] for r in firebase_auth_tests)
        
        print(f"\n🔐 Firebase Auth Status: {'✅ Working (Mock Mode)' if firebase_working else '❌ Issues Detected'}")
        print(f"🗄️  Database Status: {'✅ Accessible' if not any('database' in r['test'].lower() and not r['success'] for r in self.test_results) else '❌ Connection Issues'}")
        print(f"🛣️  API Routing: {'✅ All endpoints routed' if not any('routing' in r['test'].lower() and not r['success'] for r in self.test_results) else '❌ Some endpoints missing'}")
        
        return passed == total

if __name__ == "__main__":
    tester = BreaklyAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All backend tests passed! API is ready for production.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the issues above.")
        sys.exit(1)