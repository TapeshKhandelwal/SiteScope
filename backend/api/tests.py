import logging
from django.test import TestCase

logger = logging.getLogger(__name__)

class SimpleTest(TestCase):
    def test_example(self):
        """
        A simple example test to ensure the test runner is working.
        """
        logger.info("Running a simple test.")
        self.assertEqual(1 + 1, 2)
        logger.info("Simple test completed successfully.")
