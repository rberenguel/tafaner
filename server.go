package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {
	port := flag.String("port", "3000", "Port to listen on")
	filePath := flag.String("file", "./whatsapp_messages.txt", "File to append messages to")
	flag.Parse()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Only POST method is accepted", http.StatusMethodNotAllowed)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		file, err := os.OpenFile(*filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			http.Error(w, "Error opening file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Append the message body followed by a newline
		if _, err := file.Write(append(body, '\n')); err != nil {
			http.Error(w, "Error writing to file", http.StatusInternalServerError)
			return
		}
		
		log.Printf("Appended message to %s", *filePath)
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "Message received and saved.")
	})

	addr := ":" + *port
	log.Printf("Server listening on %s, appending to %s", addr, *filePath)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}