awk '/});/ && !done {
  if (c == 0 && NR > 150) {
    print "  it('\''resets search query and active filters when resetToken changes'\'', async () => {"
    print "    mockUseAuth.mockReturnValue({"
    print "      session: { user: { role: '\''TEACHER'\'' }, token: '\''mock-token'\'' }"
    print "    });"
    print "    const { rerender } = render("
    print "      <QueryClientProvider client={queryClient}>"
    print "        <SnackbarProvider>"
    print "          <StudentsView />"
    print "        </SnackbarProvider>"
    print "      </QueryClientProvider>"
    print "    );"
    print "    const searchInput = await screen.findByPlaceholderText(/搜索/i);"
    print "    fireEvent.change(searchInput, { target: { value: '\''Alice'\'' } });"
    print "    expect(searchInput).toHaveValue('\''Alice'\'');"
    print "    rerender("
    print "      <QueryClientProvider client={queryClient}>"
    print "        <SnackbarProvider>"
    print "          <StudentsView resetToken={Date.now()} />"
    print "        </SnackbarProvider>"
    print "      </QueryClientProvider>"
    print "    );"
    print "    await waitFor(() => {"
    print "      expect(searchInput).toHaveValue('\'''\'');"
    print "    });"
    print "  });"
    done=1
  }
}
{ print }' frontend/src/components/students/StudentsView.test.tsx > tmp_test.tsx && mv tmp_test.tsx frontend/src/components/students/StudentsView.test.tsx
