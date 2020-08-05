from os import system, name
import socket
import numpy as np
import sys
from random import random
import pandas as pd
import pylab
import matplotlib.pyplot as plt

# For taking input from a file
# sys.stdin = open("input.txt","r")
response = ""
count = 0
nax = 20
num_states = 1

# convert 1-D array 'x' to Diagonal matrix 'y'

def one2two(x,N):
    y = np.zeros((N,N))
    for i in range(0,N):
        y[i][i]=x[i]
    return y



# The following function takes the state of the graph at time k and returns the state at time k+1
# Input : 
# x -> fraction infected at kth time
# xs -> fraction susceptible at kth time
# xr -> fraction recovered at kth time
# time_step -> duration of a single time step (Value of delta T)
# G -> Adjacency Matrix of the graph
# A -> Diag(Death Rate)
# B -> Diag(Infection Rate)
# D -> Diag(Recovery Rate)
# Y -> Diag(Reinfection Rate)
# S = A+D
# N = number of nodes in the graph
# Return value :
# x_next -> fraction infected at k+1th time
# xs_next -> fraction susceptible at k+1th time
# xr_next -> fraction recovered at k+1th time

def Add(x_init,xs_init,xr_init,xd_init,N):
    global response
    global count
    for i in range(0,N):
        count = count+1
        response += "_" + str(round(xs_init[i],4))
    for i in range(0,N):
        count = count+1
        response += "_" + str(round(x_init[i],4))
    for i in range(0,N):
        count = count+1
        response += "_" + str(round(xr_init[i],4))
    for i in range(0,N):
        count = count+1
        response += "_" + str(round(xd_init[i],4))

def Euler(x,xs,xr,time_step,G,A,B,D,Y,S,N):

    Xs = one2two(xs,N)
    Xr = one2two(xr,N)

    Xs = Xs.dot(B)
    Xs = Xs.dot(G)
    Xs = Xs.dot(x)

    Xr = Xr.dot(Y)
    Xr = Xr.dot(G)
    Xr = Xr.dot(x)

    x_next = Xs+Xr-S.dot(x)
    x_next *= time_step

    x_next += x

    xs_next = xs-time_step*Xs
    xr_next = xr+time_step*(D.dot(x)-Xr)
    
    Add(x_next,xs_next,xr_next,1-x_next-xs_next-xr_next,N)
    
    return x_next,xs_next,xr_next



# The following function takes initial state and returns the state after given number of time steps
# Input :
# x_init -> Initial fraction of Infected people
# xs_init -> Initial fraction of Susceptible people
# xr_init -> Initial fraction of Recovered people
# time_step -> duration in single time step (Value of delta T)
# total_steps -> Total number of time steps
# G -> Adjacency Matrix of the graph
# A -> Diag(Death Rate)
# B -> Diag(Infection Rate)
# D -> Diag(Recovery Rate)
# Y -> Diag(Reinfection Rate)
# S = A+D
# N = number of nodes in the graph
# Return Value :
# x_init -> fraction infected after 'total_steps' time steps
# xs_init -> fraction susceptible after 'total_steps' time steps
# xr_init -> fraction recovered after 'total_steps' time steps


def iterate(x_init,xs_init,xr_init,time_step,total_steps,G,A,B,D,Y,N,vsr):
    S = A+D
    xs_initial = xs_init
    xr_initial = xr_init
    for i in range(0,total_steps):
        x_init,xs_init,xr_init = Euler(x_init,xs_init,xr_init,time_step,G,A,B,D,Y,S,N)
        # print(x_init)

        # temp = G.dot(xr_initial+xs_init-1)
        # temp *= B[0][0]/D[0][0]
        # print("Diff = ")
        # print(xs_init-np.multiply(xs_initial,np.exp(temp)))

        temp = G.dot(xr_init)
        temp *= B[0][0]/D[0][0]
        temp = np.multiply(xs_init,np.exp(temp))
        for j in range(0,nax):
            vsr[j][i] = temp[j]
    return x_init,xs_init,xr_init,1-x_init-xs_init-xr_init


def random_rate(lt,n):
    rate = np.zeros((n,n))
    for i in range(0,n):
        #print value
        rate[i][i] = lt[i]
    
    # print("\n")
    return rate

# def show_rates(mat,n):

#     for i in range(0,n):
#         print ("City " + str(i+1) + ": "+ str(mat[i][i]))


def calculate_based_on_paper(D,G):
    u = -1
    C = 0.999999999
    for i in range(0,nax):
        if D[i][i] > 0:
            if u == -1:
                u = C/(1.0*D[i][i])
                continue
            u = min(u,C/(1.0*D[i][i]))
    for i in range(0,nax):
        s = 0
        for j in range(0,nax):
            s += G[i][j]
        if s > 0:
            u = min(u,C/(1.0*s))
    return u

# Entry point for the program

def main(lr,lr_init,time_step,total_steps):
    #df = adjacency matrix
    ddf=pd.read_csv('./data/Matrix.csv',sep = ',',header = None)
    # print ("Adjacency Matrix :")    
    # print ddf
    df = np.zeros((nax,nax))
    for i in range(0,nax):
        for j in range(0,nax):
            df[i][j] = ddf[i][j]
    # N = len(df)
    N = nax
    # print(total_steps,time_step)
    # initialize x_init, xs_init, xr_init

    x_init = np.zeros((N,1))
    xs_init = np.zeros((N,1))
    xr_init = np.zeros((N,1))

    for i in range(0,N):
        xs_init[i] = lr_init[0][i]
        x_init[i]  = lr_init[1][i]
        xr_init[i] = lr_init[2][i]

    # Take input of G, B, D, Y, A                 

    #G = build(N)    
    #B = build_infection_rate(N)
    #D = build_recovery_rate(N)
    #Y = build_reinfection_rate(N)
    #A = build_death_rate(N)
    G = df
    # take random infection,recovery,reinfection and death rates less than 0.5
    B = random_rate(lr[0],N)
    # print("Infection Rates")
    # show_rates(B,N)
    D = random_rate(lr[1],N)
    # print("Recovery Rates")
    # show_rates(D,N)
    Y = random_rate(lr[2],N)
    # print("Reinfection Rates")
    # show_rates(Y,N)
    A = random_rate(lr[3],N)
    # print("Death Rates")
    # show_rates(A,N)

    time_step = calculate_based_on_paper(D,G)
    print("h Adjusted as per -- ")
    print("h*delta(i) <= 1 && h*sum(beta[i][j]) < 1")
    print("h = ",time_step)

    vsr = np.zeros((nax,total_steps))

    # iterate for 'total_steps' steps where each step has 'time_step' duration
    Add(x_init,xs_init,xr_init,1-x_init-xs_init-xr_init,N)
    x_final,xs_final,xr_final,xd_final = iterate(x_init,xs_init,xr_init,time_step,total_steps,G,A,B,D,Y,N,vsr)

    for i in range(0,nax):
        print("VSR("+str(i)+") = ")
        print(vsr[i])

    # print the final state after 'total_steps' steps

    # for i in range(0,N):
    #     print("\nFinal state of city "+str(i+1)+":")
    #     print("Percentage of infected people : "+str(x_final[i][0]*100))
    #     print("Percentage of susceptible people : "+str(xs_final[i][0]*100))
    #     print("Percentage of recovered people : "+str(xr_final[i][0]*100))
    #     print("Percentage of dead people : "+str(xd_final[i][0]*100))

def clear(): 
    _ = system('clear') 



HOST, PORT = '', 8888

listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listen_socket.bind((HOST, PORT))
listen_socket.listen(1)
print('Serving HTTP on port ${PORT} ...')
times = 1
while True:
    client_connection, client_address = listen_socket.accept()
    request_data = client_connection.recv(1024)
    clear()
    # print(times)
    times += 1
    # print(request_data.decode('utf-8'))
    s = request_data.decode('utf-8')
    r = s.split('\n')
    for e in r :
        if "GET /" in e:
            r = e
            break
    r = r[5:].split(' ')[0]
    # print("r = ")
    # print(r)
    r = r[1:].split('_')
    lr = []
    lr_init = []
    for i in range(0,4):
        curr = []
        for j in range(0,nax):
            curr.append(float(r[i*nax+j]))
        lr.append(curr)
    for i in range(0,3):
        curr = []
        for j in range(0,nax):
            curr.append(float(r[4*nax+i*nax+j]))
        lr_init.append(curr)
    response = ""
    count = 0
    main(lr,lr_init,int(r[-1]),int(r[-2]))
    response = response[1:]
    # print(count)
    # print(response)
    http_response = """\
HTTP/1.1 200 OK

{}
""".format(response)
    # print(http_response)
    client_connection.sendall(http_response.encode())
    print("Sent!!!")
    client_connection.close()