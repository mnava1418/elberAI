#!/bin/bash
cd "$(dirname "$0")"

# Fix objectVersion for CocoaPods compatibility with Xcode 26
sed -i '' 's/objectVersion = 70/objectVersion = 77/' Elber.xcodeproj/project.pbxproj

# Run pod install
pod install

# Fix RNFB input file that causes cycle with Watch target
sed -i '' '/BUILT_PRODUCTS_DIR.*INFOPLIST_PATH/d' Elber.xcodeproj/project.pbxproj

echo "✅ Done! Ready to build."
