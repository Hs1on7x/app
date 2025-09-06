#!/usr/bin/env python3
"""
Backend API Testing Suite for Hangar Visualization System
Tests all backend endpoints, database connectivity, CORS, and error handling
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        
    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        self.results["total_tests"] += 1
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED {message}")
    
    def test_api_health_check(self):
        """Test the root API endpoint /api/"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_result("API Health Check", True, f"Response: {data}")
                else:
                    self.log_result("API Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("API Health Check", False, f"Status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("API Health Check", False, f"Connection error: {str(e)}")
    
    def test_cors_configuration(self):
        """Test CORS headers are properly configured"""
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = requests.options(f"{API_BASE}/status", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            if cors_headers['Access-Control-Allow-Origin']:
                self.log_result("CORS Configuration", True, f"CORS headers present: {cors_headers}")
            else:
                self.log_result("CORS Configuration", False, "Missing CORS headers")
                
        except requests.exceptions.RequestException as e:
            self.log_result("CORS Configuration", False, f"Connection error: {str(e)}")
    
    def test_create_status_check(self):
        """Test creating a status check via POST /api/status"""
        try:
            test_data = {
                "client_name": "Kirby Building Systems Test Client"
            }
            
            response = requests.post(
                f"{API_BASE}/status", 
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "client_name", "timestamp"]
                
                if all(field in data for field in required_fields):
                    if data["client_name"] == test_data["client_name"]:
                        # Store the created ID for later tests
                        self.created_status_id = data["id"]
                        self.log_result("Create Status Check", True, f"Created status with ID: {data['id']}")
                    else:
                        self.log_result("Create Status Check", False, "Client name mismatch")
                else:
                    self.log_result("Create Status Check", False, f"Missing required fields. Got: {data}")
            else:
                self.log_result("Create Status Check", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Create Status Check", False, f"Connection error: {str(e)}")
    
    def test_get_status_checks(self):
        """Test retrieving status checks via GET /api/status"""
        try:
            response = requests.get(f"{API_BASE}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created status is in the list
                        status_item = data[0]
                        required_fields = ["id", "client_name", "timestamp"]
                        
                        if all(field in status_item for field in required_fields):
                            self.log_result("Get Status Checks", True, f"Retrieved {len(data)} status checks")
                        else:
                            self.log_result("Get Status Checks", False, f"Status items missing required fields: {status_item}")
                    else:
                        self.log_result("Get Status Checks", True, "Retrieved empty list (no status checks yet)")
                else:
                    self.log_result("Get Status Checks", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Status Checks", False, f"Status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Get Status Checks", False, f"Connection error: {str(e)}")
    
    def test_database_connectivity(self):
        """Test database operations by creating and retrieving data"""
        try:
            # Create a test status check
            test_data = {
                "client_name": "Database Connectivity Test"
            }
            
            create_response = requests.post(
                f"{API_BASE}/status", 
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if create_response.status_code != 200:
                self.log_result("Database Connectivity", False, "Failed to create test data")
                return
            
            created_data = create_response.json()
            created_id = created_data["id"]
            
            # Wait a moment for database write
            time.sleep(0.5)
            
            # Retrieve and verify the data exists
            get_response = requests.get(f"{API_BASE}/status", timeout=10)
            
            if get_response.status_code == 200:
                all_status = get_response.json()
                found = any(status["id"] == created_id for status in all_status)
                
                if found:
                    self.log_result("Database Connectivity", True, f"Successfully created and retrieved data with ID: {created_id}")
                else:
                    self.log_result("Database Connectivity", False, "Created data not found in database")
            else:
                self.log_result("Database Connectivity", False, "Failed to retrieve data from database")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Database Connectivity", False, f"Connection error: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        
        # Test 1: Invalid JSON in POST request
        try:
            response = requests.post(
                f"{API_BASE}/status",
                data="invalid json",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code >= 400:
                self.log_result("Error Handling - Invalid JSON", True, f"Properly rejected invalid JSON with status {response.status_code}")
            else:
                self.log_result("Error Handling - Invalid JSON", False, f"Should have rejected invalid JSON, got status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Error Handling - Invalid JSON", False, f"Connection error: {str(e)}")
        
        # Test 2: Missing required fields
        try:
            response = requests.post(
                f"{API_BASE}/status",
                json={},  # Empty object, missing client_name
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code >= 400:
                self.log_result("Error Handling - Missing Fields", True, f"Properly rejected missing fields with status {response.status_code}")
            else:
                self.log_result("Error Handling - Missing Fields", False, f"Should have rejected missing fields, got status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Error Handling - Missing Fields", False, f"Connection error: {str(e)}")
        
        # Test 3: Invalid endpoint
        try:
            response = requests.get(f"{API_BASE}/nonexistent", timeout=10)
            
            if response.status_code == 404:
                self.log_result("Error Handling - Invalid Endpoint", True, "Properly returned 404 for invalid endpoint")
            else:
                self.log_result("Error Handling - Invalid Endpoint", False, f"Expected 404, got {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Error Handling - Invalid Endpoint", False, f"Connection error: {str(e)}")
    
    def test_performance(self):
        """Test API response performance"""
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE}/", timeout=10)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if response.status_code == 200 and response_time < 2.0:  # Should respond within 2 seconds
                self.log_result("Performance Test", True, f"Response time: {response_time:.3f}s")
            elif response.status_code != 200:
                self.log_result("Performance Test", False, f"Request failed with status {response.status_code}")
            else:
                self.log_result("Performance Test", False, f"Slow response time: {response_time:.3f}s")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Performance Test", False, f"Connection error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for Hangar Visualization System")
        print("=" * 60)
        
        # Test order matters - some tests depend on others
        self.test_api_health_check()
        self.test_cors_configuration()
        self.test_create_status_check()
        self.test_get_status_checks()
        self.test_database_connectivity()
        self.test_error_handling()
        self.test_performance()
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']}")
        print(f"Failed: {self.results['failed']}")
        
        if self.results['errors']:
            print("\n❌ FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  - {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if self.results['failed'] == 0:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Please check the issues above.")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)