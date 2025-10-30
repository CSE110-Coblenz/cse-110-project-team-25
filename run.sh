# # Example list
# branches=("game_logic" "prompt_logic" "renderer" "typing-mechanics" "object_classes")

# git switch main
# for b in "${branches[@]}"; do
#   # ensure you have the latest version of that branch
#   git fetch origin "$b":"refs/remotes/origin/$b" || exit 1

#   echo "=== Merging $b into main ==="
#   # prefer a true merge commit for clarity (change to --ff-only if you want no merge commits)
#   git merge --no-ff "origin/$b" || {
#     echo "Resolve conflicts for $b, then:"
#     echo "  git add <files> && git commit"
#     echo "  (or git merge --abort to undo this merge)"
#     exit 1
#   }
# done

# # run tests here (strongly recommended)
# # ./run-tests
npm run dev