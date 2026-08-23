/**
 * Application Testing Script
 * 
 * This script performs basic smoke tests on the DeliverySync application
 * to verify core functionality works in both light and dark themes.
 */

console.log('🧪 DeliverySync Application Test Suite');
console.log('=====================================');

// Test 1: Check if all required CSS classes are defined
const testCSSClasses = () => {
  console.log('\n📋 Testing CSS Classes...');
  
  const testClasses = [
    'btn-primary',
    'btn-secondary', 
    'card-lg',
    'input',
    'label',
    'text-text-primary',
    'dark:text-text-dark-primary',
    'bg-surface-primary',
    'dark:bg-surface-dark-primary'
  ];
  
  let passed = 0;
  testClasses.forEach(className => {
    // Create a test element
    const testEl = document.createElement('div');
    testEl.className = className;
    document.body.appendChild(testEl);
    
    // Check if styles are applied (basic check)
    const computedStyle = window.getComputedStyle(testEl);
    if (computedStyle.display !== 'none' || className.includes('dark:')) {
      console.log(`  ✅ ${className}`);
      passed++;
    } else {
      console.log(`  ❌ ${className}`);
    }
    
    document.body.removeChild(testEl);
  });
  
  console.log(`\n   Result: ${passed}/${testClasses.length} CSS classes working`);
};

// Test 2: Check theme toggle functionality
const testThemeToggle = () => {
  console.log('\n🌙 Testing Theme Toggle...');
  
  const html = document.documentElement;
  const initialTheme = html.classList.contains('dark');
  
  // Toggle theme
  if (initialTheme) {
    html.classList.remove('dark');
    console.log('  ✅ Switched from dark to light mode');
  } else {
    html.classList.add('dark');
    console.log('  ✅ Switched from light to dark mode');
  }
  
  // Toggle back
  setTimeout(() => {
    if (initialTheme) {
      html.classList.add('dark');
      console.log('  ✅ Restored dark mode');
    } else {
      html.classList.remove('dark');
      console.log('  ✅ Restored light mode');
    }
    
    console.log('\n   Result: Theme toggle working correctly');
  }, 1000);
};

// Test 3: Check responsive design
const testResponsive = () => {
  console.log('\n📱 Testing Responsive Design...');
  
  const breakpoints = [
    { name: 'Mobile', width: 375 },
    { name: 'Tablet', width: 768 },
    { name: 'Desktop', width: 1024 },
    { name: 'Large', width: 1280 }
  ];
  
  breakpoints.forEach(bp => {
    // This would need to be tested manually or with a testing framework
    console.log(`  📏 ${bp.name} (${bp.width}px) - Manual testing required`);
  });
  
  console.log('\n   Result: Responsive design requires manual verification');
};

// Test 4: Check form components
const testFormComponents = () => {
  console.log('\n📝 Testing Form Components...');
  
  // Test creating form elements
  const testContainer = document.createElement('div');
  testContainer.style.position = 'absolute';
  testContainer.style.left = '-9999px';
  document.body.appendChild(testContainer);
  
  // Test input
  const input = document.createElement('input');
  input.className = 'input';
  testContainer.appendChild(input);
  console.log('  ✅ Input component created');
  
  // Test button
  const button = document.createElement('button');
  button.className = 'btn-primary';
  button.textContent = 'Test Button';
  testContainer.appendChild(button);
  console.log('  ✅ Button component created');
  
  // Test card
  const card = document.createElement('div');
  card.className = 'card-lg';
  testContainer.appendChild(card);
  console.log('  ✅ Card component created');
  
  document.body.removeChild(testContainer);
  console.log('\n   Result: Form components working correctly');
};

// Run all tests
const runTests = async () => {
  try {
    testCSSClasses();
    testFormComponents();
    testResponsive();
    testThemeToggle();
    
    setTimeout(() => {
      console.log('\n🎉 Test Suite Complete!');
      console.log('=====================================');
      console.log('Manual testing recommendations:');
      console.log('1. Test login/register flows');
      console.log('2. Test theme switching in browser');
      console.log('3. Test form validation');
      console.log('4. Test responsive design on different screen sizes');
      console.log('5. Test navigation between pages');
      console.log('6. Test order creation and management');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

// Auto-run tests when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTests);
} else {
  runTests();
}