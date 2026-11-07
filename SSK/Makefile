# Makefile for Sorting Algorithm Analyzer
# Works with GCC (MinGW/MSYS2) on Windows

CC      = gcc
CFLAGS  = -O2 -Wall -Wextra
TARGET  = sorting_analyzer.exe
SRC     = sorting_analyzer.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)
	@echo Build successful! Run: ./$(TARGET)

clean:
	del /f $(TARGET) 2>nul || true

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
